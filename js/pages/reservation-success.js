/*
  Reservation success celebration
  1) A confetti "cannon" shoots up from the bottom of the screen like a surprise.
  2) After the burst, a few sparks keep floating slowly in the background.
  Reduced-motion visitors only get the calm background sparks.
*/
// Wait until the preloader has faded, so the celebration is actually seen
function whenRevealed(cb) {
  const pl = document.getElementById('preloader');
  let done = false;
  const go = () => {
    if (!done) {
      done = true;
      cb();
    }
  };
  if (!pl || pl.classList.contains('done')) return go();
  const mo = new MutationObserver(() => {
    if (pl.classList.contains('done')) {
      mo.disconnect();
      setTimeout(go, 300);
    }
  });
  mo.observe(pl, { attributes: true, attributeFilter: ['class'] });
  setTimeout(go, 3200); // safety net
}

document.addEventListener('DOMContentLoaded', () => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors = ['#FF7900', '#FF9F1C', '#F4511E', '#FFB347'];

  // ---------- 1. background sparks that stay on the page ----------
  const box = document.getElementById('sparks');
  for (let i = 0; i < 22; i++) {
    const s = document.createElement('i');
    const size = 4 + Math.random() * 7;
    s.className = 'spark';
    s.style.cssText =
      `left:${Math.random() * 100}%;top:${Math.random() * 100}%;` +
      `width:${size}px;height:${size}px;background:${colors[i % colors.length]};` +
      `animation-duration:${6 + Math.random() * 6}s;animation-delay:-${Math.random() * 8}s;` +
      `opacity:${0.25 + Math.random() * 0.4}`;
    box.append(s);
  }
  if (reduce) {
    document.querySelector('.success-wrap').classList.add('go');
    return;
  }

  // ---------- 2. confetti cannons ----------
  const cv = document.getElementById('confetti');
  const ctx = cv.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0;
  let H = 0;
  const resize = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const palette = [...colors, '#FFF4E8', '#ffd08a'];
  let parts = [];

  // x: start position, angle: -90 is straight up, spread: randomness in degrees
  function fire(x, angle, spread, count) {
    const power = Math.sqrt(0.55 * H); // strong enough to reach most of the screen
    for (let i = 0; i < count; i++) {
      const a = ((angle + (Math.random() - 0.5) * spread) * Math.PI) / 180;
      const v = power * (0.55 + Math.random() * 0.65);
      parts.push({
        x,
        y: H + 10,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        w: 6 + Math.random() * 7,
        h: 4 + Math.random() * 6,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.35,
        tilt: Math.random() * 6.28,
        color: palette[Math.floor(Math.random() * palette.length)],
        round: Math.random() < 0.25,
      });
    }
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    parts = parts.filter((p) => !(p.y > H + 40 && p.vy > 0));
    parts.forEach((p) => {
      p.vx *= 0.992;
      p.vy += 0.32; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.tilt += 0.12;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2.2, 0, 6.28);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, (-p.h / 2) * Math.cos(p.tilt), p.w, p.h * Math.cos(p.tilt));
      }
      ctx.restore();
    });
    if (parts.length || started < 3) requestAnimationFrame(frame);
    else cv.remove(); // celebration over; the sparks keep floating
  }

  let started = 0;
  const begin = () => {
    document.querySelector('.success-wrap').classList.add('go');
    const wave = (delay, fn) =>
      setTimeout(() => {
        fn();
        started += 1;
      }, delay);
    wave(150, () => {
      fire(W * 0.12, -72, 34, 70);
      fire(W * 0.88, -108, 34, 70);
    });
    wave(450, () => fire(W * 0.5, -90, 60, 90));
    wave(850, () => {
      fire(W * 0.2, -80, 40, 45);
      fire(W * 0.8, -100, 40, 45);
    });
    requestAnimationFrame(frame);
  };
  whenRevealed(begin);
});
