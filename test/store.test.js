const assert = require("assert");
const S = require("../store.js");

function mem() {
  const m = {};
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = v; } };
}

// Pusty start: dwie stałe osoby
let st = mem();
let d = S.load(st);
assert.strictEqual(d.active, "Fryderyk");
assert.deepStrictEqual(d.people, { Fryderyk: {}, Asieńka: {} });

// Zaznaczanie i zapis
S.toggle(d, "czapka", true);
S.save(st, d);
assert.strictEqual(S.load(st).people.Fryderyk.czapka, true);
S.toggle(d, "czapka", false);
assert.ok(!("czapka" in d.people.Fryderyk));

// Dwie przeglądarki = dwa niezależne zapisy
const a = mem(), b = mem();
const da = S.load(a); S.toggle(da, "kijki", true); S.save(a, da);
assert.deepStrictEqual(S.load(b).people.Fryderyk, {});

// Listy osób są rozdzielone
d = S.empty();
S.toggle(d, "termos", true);
S.setActive(d, "Asieńka");
assert.strictEqual(d.active, "Asieńka");
assert.deepStrictEqual(d.people.Asieńka, {});
S.setActive(d, "Ktoś");
assert.strictEqual(d.active, "Asieńka", "nieznanej osoby nie wybieramy");

// Stary zapis z innymi osobami: zostają tylko stałe
st = mem(); st.setItem(S.KEY, JSON.stringify({ active: "Ja", people: { Ja: { x: true }, Asieńka: { y: true } } }));
d = S.load(st);
assert.deepStrictEqual(Object.keys(d.people), ["Fryderyk", "Asieńka"]);
assert.strictEqual(d.active, "Fryderyk");
assert.deepStrictEqual(d.people.Asieńka, { y: true });

// Uszkodzony zapis nie wywraca strony
st = mem(); st.setItem(S.KEY, "{zepsute");
assert.deepStrictEqual(S.load(st), { ...S.empty(), pending: [] });

// Kliknięcia trafiają do kolejki i przetrwają przeładowanie
st = mem();
d = S.load(st);
S.toggle(d, "czapka", true);
S.toggle(d, "czapka", false);
S.toggle(d, "termos", true);
S.save(st, d);
d = S.load(st);
assert.strictEqual(d.pending.length, 3);
assert.deepStrictEqual(d.people.Fryderyk, { termos: true });

// Stan z serwera zastępuje lokalny, ale niewysłane zmiany zostają na wierzchu
S.applyRemote(d, { Fryderyk: { kijki: true }, Asieńka: { czapka: true }, Obcy: { x: true } });
assert.deepStrictEqual(d.people, { Fryderyk: { kijki: true, termos: true }, Asieńka: { czapka: true } });

// Po wysłaniu kolejka się czyści, a kolejne pobranie bierze już sam serwer
S.ack(d, 3);
assert.deepStrictEqual(d.pending, []);
S.applyRemote(d, { Fryderyk: { kijki: true } });
assert.deepStrictEqual(d.people, { Fryderyk: { kijki: true }, Asieńka: {} });

// Zmiany dodane w trakcie wysyłania nie znikają przy potwierdzeniu
d = S.empty(); d.pending = [];
S.toggle(d, "a", true); S.toggle(d, "b", true);
const sent = d.pending.length;
S.toggle(d, "c", true);
S.ack(d, sent);
assert.deepStrictEqual(d.pending, [{ person: "Fryderyk", id: "c", checked: true }]);

// Czyszczenie listy też idzie do kolejki i nie rusza drugiej osoby
d = S.empty(); d.pending = [];
d.people.Fryderyk = { a: true }; d.people.Asieńka = { b: true };
S.resetActive(d);
assert.deepStrictEqual(d.people, { Fryderyk: {}, Asieńka: { b: true } });
assert.deepStrictEqual(d.pending, [{ person: "Fryderyk", reset: true }]);

// Stare odhaczenia z telefonu wysyłają się raz, przy pierwszym uruchomieniu
st = mem();
st.setItem(S.KEY, JSON.stringify({ active: "Asieńka", people: { Fryderyk: { a: true }, Asieńka: { b: true } } }));
d = S.migrate(st, S.load(st));
assert.deepStrictEqual(d.pending, [
  { person: "Fryderyk", id: "a", checked: true },
  { person: "Asieńka", id: "b", checked: true }
]);
S.save(st, d);
d = S.migrate(st, S.load(st));
assert.strictEqual(d.pending.length, 2, "drugi raz nic nie dochodzi");

console.log("OK");
