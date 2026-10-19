/* Menu: search + dynamic categories. Data comes from ajax/menu/list.php. */
const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, ' ');
const esc = (s) => Object.assign(document.createElement('i'), { textContent: s }).innerHTML;
let dishes = [],
  cat = 'all',
  cur = 1;
const PER = 6; // page size: change here
const grid = document.getElementById('grid'),
  st = document.getElementById('state');
// Loads dishes from ajax/menu/list.php (falls back to demo data only if that endpoint is not ready).
// Backend fields used: id, name, category, price, desc, image
async function loadDishes() {
  return (await ILE.api('menu/list.php?limit=100')).data.filter((d) => d.status !== 'Hidden');
}
function render(keepPage) {
  if (!keepPage) cur = 1; // search/category change resets pagination
  const q = norm(document.getElementById('q').value);
  const all = dishes.filter(
    (d) =>
      (cat === 'all' || norm(d.category) === cat) &&
      (!q || norm(d.name + ' ' + d.desc).includes(q)),
  );
  const tp = Math.max(1, Math.ceil(all.length / PER));
  cur = Math.min(cur, tp);
  const list = all.slice((cur - 1) * PER, cur * PER);
  document.getElementById('pager').innerHTML =
    tp > 1
      ? `<nav aria-label="Menu pages" class="d-flex gap-1 justify-content-center mt-4">${Array.from({ length: tp }, (_, i) => `<button class="chip${i + 1 === cur ? ' active' : ''}" data-pg="${i + 1}" ${i + 1 === cur ? 'aria-current="page"' : ''}>${i + 1}</button>`).join('')}</nav>`
      : '';
  grid.innerHTML = list
    .map(
      (d) =>
        `<div class="col-md-6 col-lg-4"><article class="dish"><div class="dish-img"><img src="../${esc(d.image)}" alt="${esc(d.name)}" loading="lazy" width="640" height="480" onerror="this.replaceWith(Object.assign(document.createElement('i'),{className:'fa-solid fa-utensils'}))"></div><div class="dish-body"><span class="cat">${esc(d.category)}</span><h3>${esc(d.name)}</h3><p>${esc(d.desc)}</p><div class="d-flex justify-content-between mt-2"><span class="price">${esc(d.price)}</span><a class="stretched-link small fw-semibold text-decoration-none" href="product-details.html?id=${encodeURIComponent(d.id)}">View details</a></div></div></article></div>`,
    )
    .join('');
  st.classList.toggle('d-none', list.length > 0);
  if (!list.length) {
    st.innerHTML =
      '<h3>No dishes match</h3><p class="muted">Try another word or category.</p><button class="btn btn-ile" id="reset">Reset filters</button>';
    document.getElementById('reset').onclick = () => {
      document.getElementById('q').value = '';
      cat = 'all';
      chips();
      render();
    };
  }
}
function chips() {
  const cats = [...new Set(dishes.map((d) => norm(d.category)))];
  const label = (c) => dishes.find((d) => norm(d.category) === c).category;
  document.getElementById('cats').innerHTML = ['all', ...cats]
    .map(
      (c) =>
        `<button class="chip${c === cat ? ' active' : ''}" data-c="${c}" aria-pressed="${c === cat}">${c === 'all' ? 'All Categories' : esc(label(c))}</button>`,
    )
    .join('');
}
document.addEventListener('DOMContentLoaded', async () => {
  st.classList.remove('d-none');
  st.textContent = 'Loading menu…';
  try {
    dishes = await loadDishes();
  } catch {
    st.textContent = 'Could not load the menu. Please refresh.';
    return;
  }
  chips();
  render();
  let t;
  document.getElementById('q').addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(render, 200);
  });
  document.getElementById('pager').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pg]');
    if (b) {
      cur = +b.dataset.pg;
      render(true);
      window.scrollTo({ top: 0 });
    }
  });
  document.getElementById('cats').addEventListener('click', (e) => {
    const b = e.target.closest('[data-c]');
    if (b) {
      cat = b.dataset.c;
      chips();
      render();
    }
  });
});
