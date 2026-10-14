// Zapis postępu pakowania.
// Osoby są stałe: Fryderyk i Asieńka, każde z osobną listą.
// Wspólny stan trzyma serwer (api/state.js); localStorage to kopia
// na telefonie, żeby lista działała też bez zasięgu. Zmiany, których
// nie udało się wysłać, czekają w kolejce (pending) do następnej próby.
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
    let data;
    try { data = normalize(JSON.parse(storage.getItem(KEY))); } catch (e) { data = empty(); }
    data.pending = loadPending(storage);
    return data;
  }

  function loadPending(storage) {
    try {
      const p = JSON.parse(storage.getItem(KEY + ":pending"));
      return Array.isArray(p) ? p : [];
    } catch (e) { return []; }
  }

  function save(storage, data) {
    try {
      storage.setItem(KEY, JSON.stringify({ active: data.active, people: data.people }));
      storage.setItem(KEY + ":pending", JSON.stringify(data.pending || []));
      return true;
    } catch (e) { return false; }
  }

  function queue(data, op) {
    (data.pending = data.pending || []).push(op);
    return data;
  }

  function applyOp(people, op) {
    if (!people[op.person]) return;
    if (op.reset) people[op.person] = {};
    else if (op.checked) people[op.person][op.id] = true;
    else delete people[op.person][op.id];
  }

  // Stan z serwera zastępuje kopię lokalną, ale niewysłane zmiany
  // z tego telefonu nakładamy na wierzch, żeby nie zniknęły.
  function applyRemote(data, remotePeople) {
    const people = normalize({ people: remotePeople }).people;
    (data.pending || []).forEach((op) => applyOp(people, op));
    data.people = people;
    return data;
  }

  // Odhaczenia zrobione na tym telefonie, zanim był wspólny zapis:
  // wysyłamy je raz, żeby dołączyły do wspólnej listy zamiast zniknąć.
  function migrate(storage, data) {
    try { if (storage.getItem(KEY + ":migrated")) return data; } catch (e) { return data; }
    PEOPLE.forEach((person) => Object.keys(data.people[person]).forEach((id) => queue(data, { person, id, checked: true })));
    try { storage.setItem(KEY + ":migrated", "1"); } catch (e) {}
    return data;
  }

  // Wysłane zmiany zdejmujemy z początku kolejki.
  function ack(data, count) {
    data.pending = (data.pending || []).slice(count);
    return data;
  }

  function toggle(data, itemId, checked) {
    const op = { person: data.active, id: itemId, checked: !!checked };
    applyOp(data.people, op);
    return queue(data, op);
  }

  function setActive(data, name) {
    if (PEOPLE.includes(name)) data.active = name;
    return data;
  }

  function resetActive(data) {
    const op = { person: data.active, reset: true };
    applyOp(data.people, op);
    return queue(data, op);
  }

  const api = { KEY, PEOPLE, empty, load, save, toggle, setActive, resetActive, applyRemote, ack, migrate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PackingStore = api;
})(this);
