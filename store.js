// Zapis postępu pakowania.
// Wszystko trzymamy w localStorage tej przeglądarki, więc każda osoba
// na swoim telefonie ma własną listę i nikt nie widzi cudzych odhaczeń.
// Osoby są stałe: Fryderyk i Asieńka, każde z osobną listą.
(function (root) {
  const KEY = "bieszczady-pakowanie:v1";
  const PEOPLE = ["Fryderyk", "Asieńka"];

  function empty() {
    const people = {};
    PEOPLE.forEach((n) => { people[n] = {}; });
    return { active: PEOPLE[0], people };
  }

  // Zostawiamy tylko stałe osoby; brakujące dostają pustą listę.
  function normalize(data) {
    const out = empty();
    if (!data || typeof data !== "object" || !data.people || typeof data.people !== "object") return out;
    PEOPLE.forEach((n) => {
      const p = data.people[n];
      if (p && typeof p === "object") out.people[n] = p;
    });
    if (PEOPLE.includes(data.active)) out.active = data.active;
    return out;
  }

  function load(storage) {
    try { return normalize(JSON.parse(storage.getItem(KEY))); } catch (e) { return empty(); }
  }

  function save(storage, data) {
    try { storage.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
  }

  function toggle(data, itemId, checked) {
    const p = data.people[data.active];
    if (checked) p[itemId] = true; else delete p[itemId];
    return data;
  }

  function setActive(data, name) {
    if (PEOPLE.includes(name)) data.active = name;
    return data;
  }

  function resetActive(data) {
    data.people[data.active] = {};
    return data;
  }

  const api = { KEY, PEOPLE, empty, load, save, toggle, setActive, resetActive };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PackingStore = api;
})(this);
