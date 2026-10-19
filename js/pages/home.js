/*
  Hero carousel: crossfades between the <img class="hero-slide"> tags in index.html.
  To change the pictures, edit the src attributes in index.html. No image URLs live in this file.
*/
document.addEventListener('DOMContentLoaded', () => {
  const slides = [...document.querySelectorAll('.hero-slide')];
  let i = 0;

  // If a picture fails to load, remove it so the carousel never shows a broken image
  slides.forEach((s) => s.addEventListener('error', () => s.remove()));

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || slides.length < 2) return;

  setInterval(() => {
    const live = [...document.querySelectorAll('.hero-slide')];
    if (live.length < 2) return;
    live[i % live.length].classList.remove('on');
    i = (i + 1) % live.length;
    live[i].classList.add('on');
  }, 6500);
});
