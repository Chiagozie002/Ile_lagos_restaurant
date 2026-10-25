/* Customer area logic. All data comes from ajax/ endpoints; no fake records are shown. */
const esc = (s) => Object.assign(document.createElement('i'), { textContent: s ?? '' }).innerHTML;
const statusBadge = (s) =>
  `<span class="badge-s s-${esc(s).toLowerCase()}"><i class="fa-solid fa-circle" style="font-size:.5rem"></i>${esc(s)}</span>`;
const emptyState = (icon, title, text, link) =>
  `<div class="empty"><i class="fa-solid ${icon}"></i><h3>${title}</h3><p class="muted">${text}</p>${link || ''}</div>`;
const pendingBackend = () =>
  emptyState(
    'fa-plug',
    'Waiting for the backend',
    'This data loads from a PHP endpoint that is not implemented yet.',
  );
/* Count-up: animates to the REAL supplied value once, when it scrolls into view. */
function countUp(el, value) {
  const run = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches)
      return (el.textContent = value.toLocaleString());
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / 900, 1);
      el.textContent = Math.round(value * p).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  new IntersectionObserver((es, o) => {
    if (es[0].isIntersecting) {
      run();
      o.disconnect();
    }
  }).observe(el);
}
async function loadReservations() {
  return (await ILE.api('reservations/list.php?limit=50')).data;
}
async function loadTestimonials() {
  return (await ILE.api('testimonials/list.php?mine=1&limit=50')).data;
}
const page = document.body.dataset.page;
document.addEventListener('DOMContentLoaded', async () => {
  /* DASHBOARD: summary counts derived from the real reservations list */
  if (page === 'dashboard') {
    const box = document.getElementById('recent');
    try {
      const r = await loadReservations();
      const c = (s) => r.filter((x) => x.status === s).length;
      document
        .querySelectorAll('[data-count]')
        .forEach((el) =>
          countUp(el, el.dataset.count === 'total' ? r.length : c(el.dataset.count)),
        );
      box.innerHTML = r.length
        ? r
            .slice(0, 5)
            .map(
              (x) =>
                `<div class="d-flex justify-content-between py-2 border-bottom"><span>${esc(x.date)} at ${esc(x.time)}, ${esc(x.guests)} guests</span>${statusBadge(x.status)}</div>`,
            )
            .join('')
        : emptyState(
            'fa-calendar',
            'No reservations yet',
            'Request a table to see it here.',
            '<a class="btn btn-ile" href="../pages/reservations.html">Reserve a Table</a>',
          );
    } catch {
      box.innerHTML = pendingBackend();
      document.querySelectorAll('[data-count]').forEach((e) => (e.textContent = '–'));
    }
  }
  /* MY RESERVATIONS: pending can be edited/cancelled; approved needs staff approval */
  if (page === 'reservations') {
    const box = document.getElementById('resList');
    try {
      const r = await loadReservations();
      box.innerHTML = r.length
        ? r
            .map((x) => {
              const pend = x.status === 'Pending',
                appr = x.status === 'Approved';
              return `<article class="panel mb-3"><div class="d-flex flex-wrap justify-content-between gap-2"><strong>${esc(x.reference)}</strong>${statusBadge(x.status)}</div><p class="mb-1">${esc(x.date)} at ${esc(x.time)} · ${esc(x.guests)} guests</p><small class="muted">Submitted ${esc(x.submitted)}</small>
        <div class="mt-2 d-flex gap-2 flex-wrap">${pend ? `<button class="btn-ghost btn-sm" data-act="cancel" data-id="${esc(x.id)}">Cancel request</button>` : ''}${appr ? `<button class="btn-ghost btn-sm" data-act="request-change" data-id="${esc(x.id)}">Request change or cancellation</button><span class="small muted align-self-center">Stays approved until staff decide.</span>` : ''}</div></article>`;
            })
            .join('')
        : emptyState(
            'fa-calendar',
            'No reservations yet',
            'Your requests will appear here.',
            '<a class="btn btn-ile" href="../pages/reservations.html">Reserve a Table</a>',
          );
    } catch {
      box.innerHTML = pendingBackend();
    }
    box.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      b.disabled = true;
      try {
        const fd = new FormData();
        fd.set('id', b.dataset.id);
        const res = await ILE.api(`reservations/${b.dataset.act}.php`, {
          method: 'POST',
          body: fd,
        });
        ILE.toast(res.message, 'success');
      } catch (err) {
        ILE.toast(err.message, 'error');
        b.disabled = false;
      }
    });
  }
  /* PROFILE: client-side image checks only; backend must re-validate MIME/size */
  // profile picture previews are handled by js/image-preview.js
  if (page === 'profile') ILE.handleForm(document.getElementById('pfForm'), 'profile/update.php');
  if (page === 'settings')
    ILE.handleForm(document.getElementById('pwForm'), 'profile/change-password.php', () =>
      document.getElementById('pwForm').reset(),
    );
  /* MY TESTIMONIALS: edit returns a published review to Pending (backend rule) */
  if (page === 'testimonials') {
    const body = document.getElementById('tBody');
    let sel = null,
      rating = 5;
    const stars = document.getElementById('stars');
    const paint = () =>
      stars.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i < rating));
    stars.innerHTML = [1, 2, 3, 4, 5]
      .map((i) => `<button type="button" aria-label="${i} stars">★</button>`)
      .join('');
    paint();
    stars.onclick = (e) => {
      const i = [...stars.children].indexOf(e.target.closest('button'));
      if (i >= 0) {
        rating = i + 1;
        paint();
      }
    };
    let rows = [];
    try {
      rows = await loadTestimonials();
      body.innerHTML = rows.length
        ? rows
            .map(
              (t, i) =>
                `<tr><td data-label="#">${i + 1}</td><td data-label="Review">${esc(t.text)}</td><td data-label="Rating"><span class="stars">${'★'.repeat(t.rating)}</span></td><td data-label="Created">${esc(t.created)}</td><td data-label="Status">${statusBadge(t.status)}</td><td data-label="Actions"><div class="row-actions"><button class="act" data-e="${i}"><i class="fa-solid fa-pen"></i>Edit</button><button class="act act-danger" data-d="${i}"><i class="fa-regular fa-trash-can"></i>Delete</button></div></td></tr>`,
            )
            .join('')
        : `<tr><td colspan="6">${emptyState('fa-star', 'No testimonials yet', 'After a visit, share your experience.')}</td></tr>`;
    } catch {
      body.innerHTML = `<tr><td colspan="6">${pendingBackend()}</td></tr>`;
    }
    body.onclick = (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.e) {
        sel = rows[b.dataset.e];
        document.getElementById('eText').value = sel.text;
        rating = sel.rating;
        paint();
        bootstrap.Modal.getOrCreateInstance('#editModal').show();
      }
      if (b.dataset.d) {
        sel = rows[b.dataset.d];
        bootstrap.Modal.getOrCreateInstance('#delModal').show();
      }
    };
    const send = async (ep, extra, modal, btn) => {
      btn.disabled = true;
      try {
        const fd = new FormData();
        fd.set('id', sel.id);
        Object.entries(extra).forEach(([k, v]) => fd.set(k, v));
        const r = await ILE.api(ep, { method: 'POST', body: fd });
        ILE.toast(r.message, 'success');
        bootstrap.Modal.getInstance(modal).hide();
      } catch (err) {
        ILE.toast(err.message, 'error');
      }
      btn.disabled = false;
    };
    document.getElementById('eSave').onclick = (e) =>
      send(
        'testimonials/update.php',
        { text: document.getElementById('eText').value, rating },
        '#editModal',
        e.target,
      );
    document.getElementById('dConfirm').onclick = (e) =>
      send('testimonials/delete.php', {}, '#delModal', e.target);
  }
});
