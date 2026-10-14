(function () {
  const S = window.PackingStore;
  const LIST = window.PACKING_LIST;
  let storage;
  try { storage = window.localStorage; } catch (e) { storage = null; }
  const memory = { _v: null, getItem() { return this._v; }, setItem(k, v) { this._v = v; } };
  const store = storage || memory;

  let data = S.load(store);

  const $ = (id) => document.getElementById(id);
  const listEl = $("list");
  const peopleEl = $("people");
  const CHECK = '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function renderList() {
    listEl.innerHTML = LIST.map((cat) => `
      <section data-cat="${cat.id}">
        <h2>${esc(cat.name)}<span class="cat-count"></span></h2>
        <ul>${cat.items.map((it) => `
          <li><label class="item" for="i-${it.id}">
            <input type="checkbox" id="i-${it.id}" data-id="${it.id}">
            <span class="box">${CHECK}</span>
            <span class="txt">${esc(it.name)}${it.hint ? `<small>${esc(it.hint)}</small>` : ""}</span>
            ${it.qty ? `<span class="qty">${esc(it.qty)}</span>` : "<span></span>"}
          </label></li>`).join("")}
        </ul>
      </section>`).join("");
  }

  function renderPeople() {
    peopleEl.innerHTML = S.PEOPLE.map((n) => `
      <button type="button" class="chip${n === data.active ? " active" : ""}" data-person="${esc(n)}" aria-pressed="${n === data.active}">${esc(n)}</button>`).join("");
  }

  function applyChecks() {
    const mine = data.people[data.active];
    listEl.querySelectorAll("input[data-id]").forEach((i) => { i.checked = !!mine[i.dataset.id]; });
    update();
  }

  function update() {
    const all = [...listEl.querySelectorAll("input[data-id]")];
    const done = all.filter((i) => i.checked).length;
    $("count").textContent = `${done} / ${all.length} spakowane`;
    $("fill").style.width = (all.length ? (done / all.length) * 100 : 0) + "%";
    $("done-msg").hidden = done !== all.length;
    listEl.querySelectorAll("section").forEach((s) => {
      const b = [...s.querySelectorAll("input")];
      const d = b.filter((i) => i.checked).length;
      s.querySelector(".cat-count").textContent = `${d}/${b.length}`;
      s.querySelector("h2").classList.toggle("complete", d === b.length);
    });
  }

  function persist() {
    if (!S.save(store, data)) $("storage-warn").hidden = false;
  }

  listEl.addEventListener("change", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    S.toggle(data, id, e.target.checked);
    persist();
    update();
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
    btn.addEventListener("click", () => {
      if (!btn.classList.contains("armed")) {
        btn.dataset.label = btn.textContent;
        btn.classList.add("armed"); btn.textContent = label;
        t = setTimeout(() => { btn.classList.remove("armed"); btn.textContent = btn.dataset.label; }, 3000);
        return;
      }
      clearTimeout(t);
      btn.classList.remove("armed");
      action();
    });
  }
  armed($("reset"), "Na pewno?", () => { S.resetActive(data); persist(); $("reset").textContent = "Wyczyść"; applyChecks(); });

  if (!storage) $("storage-warn").hidden = false;
  renderList();
  renderPeople();
  applyChecks();
})();
