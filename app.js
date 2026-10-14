(function () {
  const S = window.PackingStore;
  const LIST = window.PACKING_LIST;
  const SHARED_IDS = LIST.filter((c) => c.shared).flatMap((c) => c.items.map((it) => it.id));
  let storage;
  try { storage = window.localStorage; } catch (e) { storage = null; }
  const memory = { _v: null, getItem() { return this._v; }, setItem(k, v) { this._v = v; } };
  const store = storage || memory;

  let data = S.migrate(store, S.load(store), SHARED_IDS);

  const $ = (id) => document.getElementById(id);
  const listEl = $("list");
  const peopleEl = $("people");
  const CHECK = '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const qty = (q) => (/^\d+$/.test(q) ? `×${q}` : q);

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function renderList() {
    const firstShared = LIST.find((c) => c.shared);
    listEl.innerHTML = LIST.map((cat) => `
      ${cat === firstShared ? `<div class="group"><span class="icon" aria-hidden="true">group</span><div><h3>Wspólne</h3><p>Takie same u Asieńki i Fryderyka.</p></div></div>` : ""}
      <section data-cat="${cat.id}">
        <h2><span>${esc(cat.name)}</span><span class="cat-count"><span class="icon" aria-hidden="true">check_circle</span><span class="n"></span></span></h2>
        <ul>${cat.items.map((it) => `
          <li><label class="item" for="i-${it.id}">
            <input type="checkbox" id="i-${it.id}" data-id="${it.id}" data-owner="${cat.shared ? S.SHARED : ""}">
            <span class="box-wrap"><span class="box">${CHECK}</span></span>
            <span class="txt">${esc(it.name)}${it.hint ? `<small>${esc(it.hint)}</small>` : ""}</span>
            ${it.qty && it.qty !== "1" ? `<span class="qty">${esc(qty(it.qty))}</span>` : "<span></span>"}
          </label></li>`).join("")}
        </ul>
      </section>`).join("");
  }

  function renderPeople() {
    peopleEl.innerHTML = S.PEOPLE.map((n) => `
      <button type="button" class="segment" data-person="${esc(n)}" aria-pressed="${n === data.active}"><span class="icon" aria-hidden="true">check</span>${esc(n)}</button>`).join("");
  }

  function applyChecks() {
    listEl.querySelectorAll("input[data-id]").forEach((i) => {
      i.checked = !!data.people[i.dataset.owner || data.active][i.dataset.id];
    });
    update();
  }

  function update() {
    const all = [...listEl.querySelectorAll("input[data-id]")];
    const done = all.filter((i) => i.checked).length;
    $("count").textContent = `${done} / ${all.length} spakowane`;
    const pct = all.length ? (done / all.length) * 100 : 0;
    // Przerwa 4px między wskaźnikiem a torem, jak w M3
    $("fill").style.width = done === all.length ? "100%" : `calc(${pct}% - 4px)`;
    $("progress").classList.toggle("full", done === all.length);
    $("progress").classList.toggle("empty", done === 0);
    $("progress").setAttribute("aria-valuenow", Math.round(pct));
    $("done-msg").hidden = done !== all.length;
    listEl.querySelectorAll("section").forEach((s) => {
      const b = [...s.querySelectorAll("input")];
      const d = b.filter((i) => i.checked).length;
      s.querySelector(".cat-count .n").textContent = `${d}/${b.length}`;
      s.querySelector("h2").classList.toggle("complete", d === b.length);
    });
  }

  function persist() {
    if (!S.save(store, data)) $("storage-warn").hidden = false;
  }

  // Synchronizacja z serwerem: wysyłamy kolejkę, potem pobieramy wspólny stan.
  // Gdy serwera nie ma albo nie ma zasięgu, lista działa lokalnie i próbuje ponownie.
  const API = "api/state";
  const POLL_MS = 5000;
  let syncing = false;
  let online = null;

  function setSync(state) {
    if (online === state) return;
    online = state;
    $("sync").textContent = state
      ? "Wspólna lista: zmiany widać na obu telefonach."
      : "Brak połączenia z serwerem. Odhaczenia zapisują się na tym telefonie i wyślą się później.";
    $("sync-icon").textContent = state ? "cloud_done" : "cloud_off";
    $("sync-row").classList.toggle("off", !state);
  }

  async function sync() {
    if (syncing) return;
    syncing = true;
    try {
      if (data.pending.length) {
        const sent = data.pending.length;
        const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ops: data.pending }) });
        if (!r.ok) throw new Error(r.status);
        S.ack(data, sent);
        persist();
      }
      const r = await fetch(API, { cache: "no-store" });
      if (!r.ok) throw new Error(r.status);
      const remote = await r.json();
      const before = JSON.stringify(data.people);
      S.applyRemote(data, remote.people);
      if (JSON.stringify(data.people) !== before) { persist(); applyChecks(); }
      setSync(true);
    } catch (e) {
      setSync(false);
    } finally {
      syncing = false;
    }
    // Zmiany kliknięte w trakcie wysyłania idą od razu, a nie przy następnym odpytaniu.
    if (online && data.pending.length) sync();
  }

  listEl.addEventListener("change", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    S.toggle(data, id, e.target.checked, e.target.dataset.owner);
    persist();
    update();
    sync();
  });

  peopleEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    S.setActive(data, btn.dataset.person);
    persist(); renderPeople(); applyChecks();
  });

  // Przycisk wymagający potwierdzenia drugim kliknięciem
  function armed(btn, label, action) {
    let t;
    const text = btn.querySelector(".label");
    const original = text.textContent;
    const disarm = () => { btn.classList.remove("armed"); text.textContent = original; };
    btn.addEventListener("click", () => {
      if (!btn.classList.contains("armed")) {
        btn.classList.add("armed"); text.textContent = label;
        t = setTimeout(disarm, 3000);
        return;
      }
      clearTimeout(t);
      disarm();
      action();
    });
  }
  armed($("reset"), "Na pewno?", () => { S.resetActive(data); persist(); applyChecks(); sync(); });

  // Przyklejony pasek postępu dostaje kolor surface-container, jak górny pasek w M3 po przewinięciu
  const bar = $("bar");
  const onScroll = () => bar.classList.toggle("stuck", bar.getBoundingClientRect().top <= 0 && window.scrollY > 0);
  window.addEventListener("scroll", onScroll, { passive: true });

  if (!storage) $("storage-warn").hidden = false;
  renderList();
  renderPeople();
  applyChecks();
  sync();
  setInterval(() => { if (!document.hidden) sync(); }, POLL_MS);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) sync(); });
  window.addEventListener("online", sync);
})();
