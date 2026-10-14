const assert = require("assert");
const S = require("../store.js");

function mem() {
  const m = {};
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = v; } };
}

// Pusty start
let st = mem();
let d = S.load(st);
assert.strictEqual(d.active, "Ja");
assert.deepStrictEqual(d.people, { Ja: {} });

// Zaznaczanie i zapis
S.toggle(d, "czapka", true);
S.save(st, d);
assert.strictEqual(S.load(st).people.Ja.czapka, true);
S.toggle(d, "czapka", false);
assert.ok(!("czapka" in d.people.Ja));

// Dwie przeglądarki = dwa niezależne zapisy
const a = mem(), b = mem();
const da = S.load(a); S.toggle(da, "kijki", true); S.save(a, da);
assert.deepStrictEqual(S.load(b).people.Ja, {});

// Profile na jednym urządzeniu są rozdzielone
d = S.empty();
S.toggle(d, "termos", true);
assert.ok(S.addPerson(d, "Ola").ok);
assert.strictEqual(d.active, "Ola");
assert.deepStrictEqual(d.people.Ola, {});
assert.ok(!S.addPerson(d, "Ola").ok, "duplikat");
assert.ok(!S.addPerson(d, "   ").ok, "puste imię");
S.removePerson(d, "Ola");
assert.strictEqual(d.active, "Ja");
S.removePerson(d, "Ja");
assert.ok(d.people.Ja, "ostatniej osoby nie usuwamy");

// Uszkodzony zapis nie wywraca strony
st = mem(); st.setItem(S.KEY, "{zepsute");
assert.deepStrictEqual(S.load(st), S.empty());

console.log("OK");
