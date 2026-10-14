// Zapis postępu pakowania.
// Wszystko trzymamy w localStorage tej przeglądarki, więc każda osoba
// na swoim telefonie ma własną listę i nikt nie widzi cudzych odhaczeń.
// Na jednym urządzeniu można dodatkowo założyć kilka osób (profile).
(function (root) {
  const KEY = "bieszczady-pakowanie:v1";
  const DEFAULT_PERSON = "Ja";

  function empty() {
    return { active: DEFAULT_PERSON, people: { [DEFAULT_PERSON]: {} } };
  }

  function normalize(data) {
    if (!data || typeof data !== "object" || !data.people || typeof data.people !== "object") return empty();
    const names = Object.keys(data.people);
    if (names.length === 0) return empty();
    if (!names.includes(data.active)) data.active = names[0];
    return data;
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

  function addPerson(data, name) {
    name = String(name || "").trim().slice(0, 24);
    if (!name || data.people[name]) return { data, ok: false };
    data.people[name] = {};
    data.active = name;
    return { data, ok: true };
  }

  function removePerson(data, name) {
    if (!data.people[name] || Object.keys(data.people).length === 1) return data;
    delete data.people[name];
    if (data.active === name) data.active = Object.keys(data.people)[0];
    return data;
  }

  function resetActive(data) {
    data.people[data.active] = {};
    return data;
  }

  const api = { KEY, empty, load, save, toggle, addPerson, removePerson, resetActive };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PackingStore = api;
})(this);
