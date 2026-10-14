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
assert.deepStrictEqual(S.load(st), S.empty());

console.log("OK");
