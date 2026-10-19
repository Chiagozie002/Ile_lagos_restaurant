/*
  Product details: STATIC page. The dish is plain HTML so you can output it with PHP.
  The only script here is the gallery: clicking a thumbnail swaps the large image.
*/
document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('main');
  const thumbs = document.getElementById('thumbs');
  if (!main || !thumbs) return;

  thumbs.addEventListener('click', (e) => {
    const btn = e.target.closest('.thumb');
    if (!btn) return;
    main.src = btn.dataset.src;
    thumbs.querySelectorAll('.thumb').forEach((t) => t.classList.toggle('on', t === btn));
  });
});
