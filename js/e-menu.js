/*
  E-MENU (guest menu opened from the QR code)
  - Loads dishes from ajax/emenu/list.php (public endpoint).
  - If that endpoint is not available yet, ILE.api falls back to demo data (see js/demo-store.js).
  - Search, category filter and pagination all reset to page 1 when the filters change.
  Response contract: { success, data:[{id,name,category,price,desc}], categories:[...], page, limit, total, totalPages }
*/
const PER_PAGE = 8; // dishes per page
const state = { page: 1, q: '', category: '' };
let chipsBuilt = false;

const rows = document.getElementById('emRows');
const pager = document.getElementById('emPager');
const chips = document.getElementById('emChips');
const search = document.getElementById('emSearch');

const esc = (s) => Object.assign(document.createElement('i'), { textContent: s ?? '' }).innerHTML;
const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

function skeleton() {
  rows.innerHTML = Array.from(
    { length: 6 },
    () =>
      '<tr class="sk"><td><i style="width:60%"></i></td><td><i style="width:50%"></i></td><td><i style="width:40%"></i></td></tr>',
  ).join('');
  pager.innerHTML = '';
}

function stateRow(icon, title, text, button) {
  rows.innerHTML = `<tr><td colspan="3"><div class="em-state"><i class="fa-solid ${icon}"></i><h2>${title}</h2><p class="mb-2">${text}</p>${button || ''}</div></td></tr>`;
  pager.innerHTML = '';
}

function buildChips(categories) {
  chipsBuilt = true;
  const all = ['', ...categories];
  chips.innerHTML = all
    .map(
      (c) =>
        `<button type="button" class="em-chip${c === state.category ? ' active' : ''}" data-cat="${esc(c)}" aria-pressed="${c === state.category}">${c || 'All dishes'}</button>`,
    )
    .join('');
}

function drawPager(r) {
  const from = r.total ? (r.page - 1) * r.limit + 1 : 0;
  const to = Math.min(r.page * r.limit, r.total);
  const tp = r.totalPages || 1;
  const pages = Array.from({ length: tp }, (_, i) => i + 1)
    .map(
      (n) =>
        `<button type="button" class="em-pg${n === r.page ? ' on' : ''}" data-page="${n}" ${n === r.page ? 'aria-current="page"' : ''}>${n}</button>`,
    )
    .join('');
  pager.innerHTML = `<span>Showing ${from}–${to} of ${r.total}</span><div class="pages"><button type="button" class="em-pg" data-page="${r.page - 1}" ${r.page <= 1 ? 'disabled' : ''} aria-label="Previous page"><i class="fa-solid fa-chevron-left"></i></button>${pages}<button type="button" class="em-pg" data-page="${r.page + 1}" ${r.page >= tp ? 'disabled' : ''} aria-label="Next page"><i class="fa-solid fa-chevron-right"></i></button></div>`;
}

async function load() {
  skeleton();
  const p = new URLSearchParams({ page: state.page, limit: PER_PAGE });
  if (state.q) p.set('q', state.q);
  if (state.category) p.set('category', state.category);
  try {
    const r = await ILE.api('emenu/list.php?' + p);
    if (!chipsBuilt && r.categories) buildChips(r.categories);
    if (!r.data.length) {
      return stateRow(
        'fa-magnifying-glass',
        'No dishes found',
        'Try a different word or category.',
        '<button type="button" class="em-chip active" id="emClear">Clear filters</button>',
      );
    }
    rows.innerHTML = r.data
      .map(
        (d) =>
          `<tr><td class="em-dish"><strong>${esc(d.name)}</strong>${d.desc ? `<small>${esc(d.desc)}</small>` : ''}</td>` +
          `<td class="cat-cell"><span class="em-cat c-${slug(d.category)}">${esc(d.category)}</span></td>` +
          `<td class="num"><span class="em-price">${esc(d.price)}</span></td></tr>`,
      )
      .join('');
    drawPager(r);
  } catch (e) {
    stateRow(
      'fa-plug-circle-exclamation',
      'The menu could not be loaded',
      'Please ask a member of our team, or try again.',
      '<button type="button" class="em-chip active" id="emRetry">Try again</button>',
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let timer;
  search.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.q = search.value.trim();
      state.page = 1;
      load();
    }, 250);
  });
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    state.category = b.dataset.cat;
    state.page = 1;
    chips.querySelectorAll('.em-chip').forEach((c) => {
      const on = c === b;
      c.classList.toggle('active', on);
      c.setAttribute('aria-pressed', on);
    });
    load();
  });
  pager.addEventListener('click', (e) => {
    const b = e.target.closest('[data-page]');
    if (!b || b.disabled) return;
    state.page = +b.dataset.page;
    load();
    document.querySelector('.em-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  rows.addEventListener('click', (e) => {
    if (e.target.closest('#emRetry')) load();
    if (e.target.closest('#emClear')) {
      search.value = '';
      Object.assign(state, { q: '', category: '', page: 1 });
      chips.querySelectorAll('.em-chip').forEach((c, i) => c.classList.toggle('active', i === 0));
      load();
    }
  });
  load();
});
