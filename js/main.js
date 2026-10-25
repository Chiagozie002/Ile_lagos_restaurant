/* Shared behaviour: theme, preloader, reveal, toasts, profile dropdown, logout modal. */
(() => {
  // Storage can be blocked (private mode, strict settings): never let that break the page
  let saved = null;
  try {
    saved = localStorage.getItem('ile-theme');
  } catch (e) {}
  document.documentElement.dataset.theme =
    saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
})(); // runs in <head> to prevent a wrong-theme flash
window.ILE = {
  toast(msg, type = 'info') {
    const box = document.getElementById('toasts');
    if (!box) return;
    if ([...box.children].some((c) => c.dataset.m === type + msg)) return; // no duplicate toasts
    const icon = {
      success: 'fa-circle-check',
      error: 'fa-circle-xmark',
      warning: 'fa-triangle-exclamation',
      info: 'fa-circle-info',
    }[type];
    const t = document.createElement('div');
    t.className = `toast-ile ${type}`;
    t.setAttribute('role', type === 'error' ? 'alert' : 'status');
    t.innerHTML = `<i class="fa-solid ${icon}"></i><span></span><button aria-label="Dismiss"><i class="fa-solid fa-xmark"></i></button>`;
    t.dataset.m = type + msg;
    t.querySelector('span').textContent = msg;
    box.append(t);
    const kill = () => t.remove();
    t.querySelector('button').onclick = kill;
    setTimeout(kill, 5000);
  },
  // Central endpoint helper. Adjust window.ILE_ROOT per page if hosting in a subdirectory (see README).
  /*
    ILE.api: calls ajax/<path>. A real backend answer (valid JSON, including 401/422 errors) is always used.
    Only when the endpoint is missing (404/501), offline, or not JSON, it falls back to js/demo-store.js
    (if window.ILE_DEMO is true). Set ILE_DEMO to false in demo-store.js once your PHP backend is ready.
  */
  async api(path, opts = {}) {
    let res, json;
    try {
      res = await fetch((window.ILE_ROOT || '') + 'ajax/' + path, {
        headers: { Accept: 'application/json' },
        ...opts,
      });
      if (res.status === 404 || res.status === 501) throw new Error('endpoint-missing');
      json = await res.json();
    } catch (e) {
      if (window.ILE_DEMO && window.ILE && ILE.demo) return ILE.demo.handle(path, opts);
      throw new Error('Network error or the server endpoint is not available yet.');
    }
    if (!res.ok || !json.success) throw new Error(json.message || 'Request failed.');
    return json;
  },
};
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.remove('no-js');
  const tg = document.getElementById('themeToggle');
  if (tg && tg.classList.contains('theme-toggle'))
    tg.insertAdjacentHTML('beforeend', '<b class="tt-track" aria-hidden="true"><b></b></b>');
  const paint = () => {
    const d = document.documentElement.dataset.theme === 'dark';
    tg.querySelector('i').className = 'fa-solid ' + (d ? 'fa-sun' : 'fa-moon');
    tg.querySelector('span').textContent = d ? 'DARK' : 'LIGHT';
    tg.setAttribute('aria-label', `Switch to ${d ? 'light' : 'dark'} theme`);
  };
  if (tg) {
    paint();
    tg.onclick = () => {
      const n = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = n;
      try {
        localStorage.setItem('ile-theme', n);
      } catch (e) {}
      paint();
      tg.classList.add('spin');
      setTimeout(() => tg.classList.remove('spin'), 500);
    };
  }
  // Preloader: always dismissed, never waits on a backend.
  const pl = document.getElementById('preloader');
  const words = ['Lighting the grill', 'Setting the table', 'Warming the plates', 'Almost ready'];
  const wEl = pl && pl.querySelector('small');
  let wi = 0;
  const wt =
    wEl &&
    setInterval(() => {
      wEl.textContent = words[++wi % words.length] + '…';
    }, 700);
  const hide = () => {
    clearInterval(wt);
    pl && pl.classList.add('done');
  };
  addEventListener('load', () => setTimeout(hide, 500));
  setTimeout(hide, 2500);
  // Scroll reveal (runs once per element)
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12 },
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  // Close the mobile menu after a link is chosen
  document
    .querySelectorAll('#nav .nav-link')
    .forEach((a) =>
      a.addEventListener('click', () => bootstrap.Offcanvas.getInstance('#nav')?.hide()),
    );
  // Highlight the current page inside the profile dropdown
  document.querySelectorAll('.profile-menu a[href]').forEach((a) => {
    if (new URL(a.href, location.href).pathname === location.pathname) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
  // Profile dropdown. On phones it opens as a card under the bar with the page dimmed behind it.
  const isPhone = () => matchMedia('(max-width: 575px)').matches;
  let backdrop = null;
  const closeAll = () => {
    document.querySelectorAll('.profile-menu.open').forEach((m) => {
      m.classList.remove('open');
      m.style.top = '';
      m.previousElementSibling.setAttribute('aria-expanded', 'false');
    });
    if (backdrop) {
      backdrop.remove();
      backdrop = null;
    }
  };
  document.querySelectorAll('.profile-btn').forEach((b) => {
    b.onclick = (e) => {
      e.stopPropagation();
      const m = b.nextElementSibling;
      const wasOpen = m.classList.contains('open');
      closeAll();
      if (wasOpen) return;
      if (isPhone()) {
        const bar = b.closest('.ile-nav, .topbar');
        if (bar) m.style.top = bar.getBoundingClientRect().bottom + 8 + 'px';
        backdrop = document.createElement('div');
        backdrop.className = 'menu-backdrop';
        document.body.append(backdrop);
      }
      m.classList.add('open');
      b.setAttribute('aria-expanded', 'true');
    };
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.profile-wrap')) closeAll();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
  window.addEventListener('resize', closeAll);
  // Logout: confirm first; redirect only after the server confirms.
  document.querySelectorAll('[data-logout]').forEach(
    (b) =>
      (b.onclick = () => {
        closeAll();
        bootstrap.Modal.getOrCreateInstance('#logoutModal').show();
      }),
  );
  const lc = document.getElementById('logoutConfirm');
  if (lc)
    lc.onclick = async () => {
      lc.disabled = true;
      try {
        await ILE.api('auth/customer/logout.php', { method: 'POST' });
        location.href = (window.ILE_ROOT || '') + 'index.html';
      } catch (e) {
        ILE.toast('Logout is pending backend integration: ' + e.message, 'warning');
        lc.disabled = false;
      }
    };
  document.getElementById('year')?.append(new Date().getFullYear());
});
