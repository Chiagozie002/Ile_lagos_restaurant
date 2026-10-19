/* Admin logic. Every list uses the pagination contract {success,data,page,limit,total,totalPages}.
   Nothing is faked: if an endpoint fails, a clear "backend pending" state is shown. */
const esc = (s) => Object.assign(document.createElement('i'), { textContent: s ?? '' }).innerHTML;
const badge = (s) =>
  `<span class="badge-s s-${esc(s).toLowerCase()}"><i class="fa-solid fa-circle" style="font-size:.5rem"></i>${esc(s)}</span>`;
const pending = (m = 'Waiting for the backend. This endpoint is not implemented yet.') =>
  `<div class="empty"><i class="fa-solid fa-plug"></i><p class="muted mb-0">${m}</p></div>`;
const empty = (t) =>
  `<div class="empty"><i class="fa-regular fa-folder-open"></i><p class="muted mb-0">${t}</p></div>`;
function countUp(el, v) {
  const go = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches)
      return (el.textContent = Number(v).toLocaleString());
    const t0 = performance.now();
    const f = (t) => {
      const p = Math.min((t - t0) / 900, 1);
      el.textContent = Math.round(v * p).toLocaleString();
      if (p < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  };
  new IntersectionObserver((e, o) => {
    if (e[0].isIntersecting) {
      go();
      o.disconnect();
    }
  }).observe(el);
}
/* Shared confirm modal: nothing destructive runs until the admin confirms; success shown only after the server confirms. */
function confirmAction(title, text, run) {
  document.getElementById('cTitle').textContent = title;
  document.getElementById('cText').textContent = text;
  const b = document.getElementById('cOk'),
    m = bootstrap.Modal.getOrCreateInstance('#confirmModal');
  b.onclick = async () => {
    b.disabled = true;
    try {
      const r = await run();
      ILE.toast(r.message || 'Done.', 'success');
      m.hide();
    } catch (e) {
      ILE.toast(e.message, 'error');
    }
    b.disabled = false;
  };
  m.show();
}
const post = (ep, obj) => {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => fd.set(k, v));
  return ILE.api(ep, { method: 'POST', body: fd });
};
/* Generic paginated table. cfg: {list, cols[{k,l,badge}], filter:{name,options}|null, actions[{l,ep,body(row),title,text}]} */
const LISTS = {
  reservations: {
    list: 'reservations/list.php',
    cols: [
      { k: 'reference', l: 'Reference' },
      { k: 'customer', l: 'Customer' },
      { k: 'date', l: 'Date' },
      { k: 'time', l: 'Time' },
      { k: 'guests', l: 'Guests' },
      { k: 'status', l: 'Status', badge: 1 },
    ],
    filter: {
      name: 'status',
      options: ['Pending', 'Approved', 'Declined', 'Cancelled', 'Completed'],
    },
    actions: ['Approved', 'Declined', 'Completed', 'Cancelled'].map((s) => ({
      l: s,
      ep: 'reservations/update-status.php',
      body: (r) => ({ id: r.id, status: s }),
      title: `Mark as ${s}?`,
      text: 'The backend validates the transition, logs it and notifies the customer.',
    })),
  },
  menu: {
    list: 'menu/list.php',
    cols: [
      { k: 'name', l: 'Dish' },
      { k: 'category', l: 'Category' },
      { k: 'price', l: 'Price' },
      { k: 'status', l: 'Status', badge: 1 },
    ],
    filter: { name: 'category', dynamic: 'menu/categories.php' },
    actions: [
      { l: 'Edit', edit: true },
      {
        l: 'Archive',
        ep: 'menu/delete.php',
        body: (r) => ({ id: r.id }),
        title: 'Archive this dish?',
        text: 'It moves to Trash and can be restored.',
      },
    ],
  },
  testimonials: {
    list: 'testimonials/list.php',
    cols: [
      { k: 'customer', l: 'Customer' },
      { k: 'text', l: 'Testimonial' },
      { k: 'rating', l: 'Rating' },
      { k: 'created', l: 'Date' },
      { k: 'status', l: 'Status', badge: 1 },
    ],
    filter: { name: 'status', options: ['Pending', 'Approved', 'Rejected'] },
    actions: [
      {
        l: 'Approve',
        ep: 'testimonials/moderate.php',
        body: (r) => ({ id: r.id, action: 'approve' }),
        title: 'Approve this testimonial?',
        text: 'It will appear publicly.',
      },
      {
        l: 'Reject',
        ep: 'testimonials/moderate.php',
        body: (r) => ({ id: r.id, action: 'reject' }),
        title: 'Reject this testimonial?',
        text: 'It will not be shown publicly.',
      },
      {
        l: 'Delete',
        ep: 'testimonials/delete.php',
        body: (r) => ({ id: r.id }),
        title: 'Move to Trash?',
        text: 'You can restore it from Trash.',
      },
    ],
  },
  messages: {
    list: 'contact/list.php',
    cols: [
      { k: 'name', l: 'Sender' },
      { k: 'email', l: 'Email' },
      { k: 'subject', l: 'Subject' },
      { k: 'preview', l: 'Preview' },
      { k: 'created', l: 'Date' },
      { k: 'status', l: 'Status', badge: 1 },
    ],
    filter: { name: 'status', options: ['Unread', 'Handled'] },
    actions: [
      {
        l: 'Mark handled',
        ep: 'contact/update-status.php',
        body: (r) => ({ id: r.id, status: 'handled' }),
        title: 'Mark as handled?',
        text: 'The message stays on record.',
      },
      {
        l: 'Delete',
        ep: 'contact/update-status.php',
        body: (r) => ({ id: r.id, status: 'deleted' }),
        title: 'Move to Trash?',
        text: 'Soft delete: it can be restored.',
      },
    ],
  },
  customers: {
    list: 'customers/list.php',
    cols: [
      { k: 'name', l: 'Name' },
      { k: 'email', l: 'Email' },
      { k: 'reservations', l: 'Reservations' },
      { k: 'joined', l: 'Joined' },
      { k: 'status', l: 'Status', badge: 1 },
    ],
    filter: { name: 'status', options: ['Active', 'Deactivated'] },
    actions: [
      {
        l: 'Deactivate',
        ep: 'customers/deactivate.php',
        body: (r) => ({ id: r.id }),
        title: 'Deactivate this customer?',
        text: 'Reservation history is kept.',
      },
    ],
  },
};

/* ---------- Action buttons: icons, danger styling, and which pages use ONE dropdown ---------- */
LISTS.reservations.select = 'Update status'; // Approve / Decline / Complete / Cancel in one dropdown
LISTS.testimonials.select = 'Moderate'; // Approve / Reject / Delete in one dropdown
const OPTION_LABEL = {
  Approved: 'Approve',
  Declined: 'Decline',
  Completed: 'Mark completed',
  Cancelled: 'Cancel',
  Delete: 'Move to Trash',
};
Object.values(LISTS).forEach((cfg) =>
  cfg.actions.forEach((a) => {
    if (OPTION_LABEL[a.l]) a.opt = OPTION_LABEL[a.l];
  }),
);
const ACTION_UI = {
  Edit: { i: 'fa-solid fa-pen' }, // icon + text
  Archive: { i: 'fa-solid fa-box-archive', iconOnly: true, danger: true },
  Delete: { i: 'fa-regular fa-trash-can', iconOnly: true, danger: true },
  'Mark handled': { i: 'fa-solid fa-check', iconOnly: true },
  Deactivate: { i: 'fa-solid fa-user-slash', danger: true }, // icon + text
};
/* View is always just an open-eye icon. */
function rowActions(cfg, i) {
  const view = `<button class="act act-icon" data-v="${i}" aria-label="View details" title="View"><i class="fa-regular fa-eye"></i></button>`;
  if (cfg.select) {
    const opts = cfg.actions
      .map((a, j) => `<option value="${j}">${a.opt || a.l}</option>`)
      .join('');
    return `<div class="row-actions">${view}<select class="act-select" data-sel="${i}" aria-label="${cfg.select}"><option value="">${cfg.select}</option>${opts}</select></div>`;
  }
  const btns = cfg.actions
    .map((a, j) => {
      const u = ACTION_UI[a.l] || { i: 'fa-solid fa-ellipsis' };
      const cls = 'act' + (u.iconOnly ? ' act-icon' : '') + (u.danger ? ' act-danger' : '');
      const label = u.iconOnly ? ` aria-label="${a.l}" title="${a.l}"` : '';
      return `<button class="${cls}" data-a="${i}:${j}"${label}><i class="${u.i}"></i>${u.iconOnly ? '' : '<span>' + a.l + '</span>'}</button>`;
    })
    .join('');
  return `<div class="row-actions">${view}${btns}</div>`;
}
function initList(page) {
  const cfg = LISTS[page],
    body = document.getElementById('rows'),
    pg = document.getElementById('pager'),
    q = document.getElementById('q'),
    fl = document.getElementById('flt'),
    lim = document.getElementById('lim'),
    dt = document.getElementById('dt');
  let cur = 1,
    rows = [],
    t;
  const load = async () => {
    body.innerHTML = `<tr><td colspan="${cfg.cols.length + 1}" class="muted">Loading…</td></tr>`;
    const p = new URLSearchParams({ page: cur, limit: lim.value, q: q.value.trim() });
    if (fl.value) p.set(cfg.filter.name, fl.value);
    if (dt && dt.value) p.set('date', dt.value);
    try {
      const r = await ILE.api(cfg.list + '?' + p);
      rows = r.data;
      if (!rows.length && cur > 1 && r.totalPages) {
        cur = r.totalPages;
        return load();
      } // last record on a page was removed
      body.innerHTML = rows.length
        ? rows
            .map(
              (x, i) =>
                `<tr>${cfg.cols.map((c) => `<td>${c.badge ? badge(x[c.k]) : esc(x[c.k])}</td>`).join('')}<td>${rowActions(cfg, i)}</td></tr>`,
            )
            .join('')
        : `<tr><td colspan="${cfg.cols.length + 1}">${empty('No matching records.')}</td></tr>`;
      const tp = Math.max(r.totalPages || 0, 1);
      pg.innerHTML = `<small class="muted">${r.total || 0} results</small><div class="d-flex gap-1"><button ${cur <= 1 ? 'disabled' : ''} data-p="${cur - 1}">Previous</button>${Array.from({ length: tp }, (_, i) => `<button class="${i + 1 === cur ? 'on' : ''}" data-p="${i + 1}" ${i + 1 === cur ? 'aria-current="page"' : ''}>${i + 1}</button>`).join('')}<button ${cur >= tp ? 'disabled' : ''} data-p="${cur + 1}">Next</button></div>`;
    } catch {
      body.innerHTML = `<tr><td colspan="${cfg.cols.length + 1}">${pending()}</td></tr>`;
      pg.innerHTML = '';
    }
  };
  const reset = () => {
    cur = 1;
    load();
  };
  q.oninput = () => {
    clearTimeout(t);
    t = setTimeout(reset, 300);
  };
  fl.onchange = reset;
  lim.onchange = reset;
  if (dt) dt.onchange = reset; // any filter change returns to page 1
  pg.onclick = (e) => {
    const b = e.target.closest('[data-p]');
    if (b && !b.disabled) {
      cur = +b.dataset.p;
      load();
    }
  };
  body.onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.v) {
      const r = rows[b.dataset.v];
      document.getElementById('dBody').innerHTML =
        '<dl class="mb-0">' +
        Object.entries(r)
          .map(([k, v]) => `<dt class="small muted">${esc(k)}</dt><dd>${esc(v)}</dd>`)
          .join('') +
        '</dl>';
      bootstrap.Modal.getOrCreateInstance('#detailModal').show();
    }
    if (b.dataset.a) {
      const [i, j] = b.dataset.a.split(':'),
        a = cfg.actions[j],
        r = rows[i];
      if (a.edit) return openEdit(r, load);
      confirmAction(a.title, a.text, async () => {
        const res = await post(a.ep, a.body(r));
        load();
        return res;
      });
    }
  };
  body.addEventListener('change', (e) => {
    const s = e.target.closest('[data-sel]');
    if (!s || s.value === '') return;
    const a = cfg.actions[s.value];
    const r = rows[s.dataset.sel];
    s.value = ''; // reset the dropdown so it can be used again
    confirmAction(a.title, a.text, async () => {
      const res = await post(a.ep, a.body(r));
      load();
      return res;
    });
  });
  (async () => {
    if (cfg.filter?.dynamic) {
      try {
        const r = await ILE.api(cfg.filter.dynamic);
        fl.innerHTML =
          '<option value="">All</option>' +
          r.data.map((c) => `<option>${esc(c)}</option>`).join('');
      } catch {}
    }
    load();
  })();
}
/* Menu edit modal: built on demand. Backend: menu/update.php validates and saves. */
function openEdit(r, reload) {
  let m = document.getElementById('editModal');
  if (!m) {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="eT"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><form class="modal-body p-4" id="eForm"><h3 id="eT">Edit dish</h3><input type="hidden" name="id"><div class="mb-2"><label class="form-label" for="en">Name</label><input class="form-control" id="en" name="name" required></div><div class="row g-2"><div class="col-sm-6"><label class="form-label" for="ec">Category</label><input class="form-control" id="ec" name="category" required></div><div class="col-sm-6"><label class="form-label" for="ep">Price</label><input class="form-control" id="ep" name="price" required></div></div><div class="my-2"><label class="form-label" for="es">Status</label><select class="form-control" id="es" name="status"><option>Available</option><option>Hidden</option></select></div><div class="d-flex gap-2 justify-content-end mt-3"><button type="button" class="btn-ghost" data-bs-dismiss="modal">Cancel</button><button class="btn btn-ile" type="submit">Save</button></div></form></div></div></div>`,
    );
    m = document.getElementById('editModal');
    ILE.handleForm(document.getElementById('eForm'), 'menu/update.php', () => {
      bootstrap.Modal.getInstance(m).hide();
      window.__reload?.();
    });
  }
  const f = document.getElementById('eForm');
  window.__reload = reload;
  f.id.value = r.id ?? '';
  f.name.value = r.name ?? '';
  f.category.value = r.category ?? '';
  f.price.value = r.price ?? '';
  f.status.value = r.status || 'Available';
  bootstrap.Modal.getOrCreateInstance(m).show();
}
const TRASH = ['menu', 'customers', 'testimonials', 'messages', 'reservations'];
async function initTrash() {
  const host = document.getElementById('trash');
  for (const t of TRASH) {
    const sec = document.createElement('section');
    sec.className = 'panel trash-sec mb-3';
    sec.innerHTML = `<div class="d-flex flex-wrap justify-content-between gap-2 mb-2"><h2 class="text-capitalize mb-0">${t}</h2><div class="bulk"></div></div><div class="list"><p class="muted">Loading…</p></div>`;
    host.append(sec);
    const list = sec.querySelector('.list'),
      bulk = sec.querySelector('.bulk');
    const load = async () => {
      try {
        const r = (await ILE.api('trash/list.php?type=' + t)).data;
        bulk.innerHTML = r.length
          ? '<button class="act" data-b="restore-all">Restore all</button> <button class="act act-danger" data-b="empty">Empty trash</button>'
          : ''; // bulk controls only when records exist
        list.innerHTML = r.length
          ? r
              .map(
                (x) =>
                  `<div class="d-flex flex-wrap justify-content-between gap-2 py-2 border-bottom"><span>${esc(x.label)} <small class="muted">deleted ${esc(x.deleted_at)}</small></span><span><button class="act" data-r="${esc(x.id)}"><i class="fa-solid fa-rotate-left"></i>Restore</button> <button class="act act-danger" data-x="${esc(x.id)}"><i class="fa-regular fa-trash-can"></i>Delete forever</button></span></div>`,
              )
              .join('')
          : empty('Nothing here.');
      } catch {
        bulk.innerHTML = '';
        list.innerHTML = pending();
      }
    };
    sec.onclick = (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const d = b.dataset;
      if (d.r)
        confirmAction('Restore this record?', 'Conflicts are reported if any exist.', async () => {
          const r = await post('trash/restore.php', { type: t, id: d.r });
          load();
          return r;
        });
      if (d.x)
        confirmAction('Delete permanently?', 'This cannot be undone.', async () => {
          const r = await post('trash/delete-permanently.php', { type: t, id: d.x });
          load();
          return r;
        });
      if (d.b === 'restore-all')
        confirmAction(
          'Restore everything in this section?',
          'Partial failures will be reported.',
          async () => {
            const r = await post('trash/restore-all.php', { type: t });
            load();
            return r;
          },
        );
      if (d.b === 'empty')
        confirmAction(
          'Empty this trash?',
          'All items here will be permanently deleted. This cannot be undone.',
          async () => {
            const r = await post('trash/empty.php', { type: t });
            load();
            return r;
          },
        );
    };
    load();
  }
}
async function initOverview() {
  // copy the public e-menu link (the page the QR code points to)
  document.getElementById('copyMenuLink')?.addEventListener('click', async () => {
    const url = new URL('e_menu/index.html', location.href).href;
    try {
      await navigator.clipboard.writeText(url);
      ILE.toast('E-menu link copied.', 'success');
    } catch (e) {
      ILE.toast('Copy failed. Link: ' + url, 'warning');
    }
  });
  const box = document.getElementById('kpis');
  try {
    const d = (await ILE.api('analytics/overview.php')).data;
    document
      .querySelectorAll('[data-k]')
      .forEach((el) => countUp(el, Number(d[el.dataset.k] ?? 0)));
  } catch {
    document.querySelectorAll('[data-k]').forEach((e) => (e.textContent = '–'));
    box.insertAdjacentHTML('afterend', pending());
  }
  const rr = document.getElementById('recentRes');
  try {
    const r = (await ILE.api('reservations/list.php?limit=5')).data;
    rr.innerHTML = r.length
      ? r
          .map(
            (x) =>
              `<div class="d-flex justify-content-between gap-2 py-2 border-bottom"><span>${esc(x.customer)} · ${esc(x.date)} ${esc(x.time)}</span>${badge(x.status)}</div>`,
          )
          .join('')
      : empty('No reservations yet.');
  } catch {
    rr.innerHTML = pending();
  }
  const note = document.getElementById('ovNote');
  try {
    const d = (await ILE.api('analytics/reservations.php?range=30')).data;
    new Chart(document.getElementById('ovChart'), {
      type: 'doughnut',
      data: {
        labels: d.status.labels,
        datasets: [
          {
            data: d.status.values,
            backgroundColor: ['#FF7900', '#FF9F1C', '#F4511E', '#8a7a6b', '#c9bcae'],
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  } catch {
    note.textContent = 'Waiting for the backend (analytics/reservations.php).';
  }
}
async function initAnalytics() {
  const mk = (id, type, labels, data, label) =>
    new Chart(document.getElementById(id), {
      type,
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: ['#FF7900', '#FF9F1C', '#F4511E', '#8a7a6b', '#c9bcae'],
            borderColor: '#FF7900',
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: type === 'doughnut' ? {} : { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
  const days = document.getElementById('range');
  const run = async () => {
    for (const id of ['trend', 'status'])
      document.getElementById(id + 'Note').textContent = 'Loading…';
    try {
      const d = (await ILE.api('analytics/reservations.php?range=' + days.value)).data;
      Chart.getChart('trend')?.destroy();
      Chart.getChart('status')?.destroy();
      mk('trend', 'line', d.trend.labels, d.trend.values, 'Reservations');
      mk('status', 'doughnut', d.status.labels, d.status.values, 'Status');
      document.getElementById('trendNote').textContent = d.trend.values.length
        ? ''
        : 'No data in this range.';
      document.getElementById('statusNote').textContent = '';
    } catch {
      for (const id of ['trend', 'status'])
        document.getElementById(id + 'Note').textContent =
          'Waiting for the backend (analytics/reservations.php).';
    }
  };
  days.onchange = run;
  run();
}
function initAddProduct() {
  const f = document.getElementById('pForm');
  // image previews are handled by js/image-preview.js ([data-multi-uploader])
  ILE.handleForm(f, 'menu/create.php', () => {
    f.reset();
    f.classList.remove('was-validated');
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const pg = document.body.dataset.page;
  if (LISTS[pg]) initList(pg);
  if (pg === 'trash') initTrash();
  if (pg === 'overview') initOverview();
  if (pg === 'analytics') initAnalytics();
  if (pg === 'add-product') initAddProduct();
  if (pg === 'profile') {
    ILE.handleForm(document.getElementById('apForm'), 'profile/update.php');
    ILE.handleForm(document.getElementById('pwForm'), 'profile/change-password.php', () =>
      document.getElementById('pwForm').reset(),
    );
  }
  // Admin logout: confirm, call the real endpoint, redirect ONLY after server success
  document.querySelectorAll('[data-admin-logout]').forEach(
    (b) =>
      (b.onclick = () =>
        confirmAction('Log out?', 'You will return to the admin login.', async () => {
          const r = await post('auth/admin/logout.php', {});
          location.href = 'login.html';
          return r;
        })),
  );
});
