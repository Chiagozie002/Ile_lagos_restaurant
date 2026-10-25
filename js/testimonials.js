/*
  Testimonials (public). Data comes from ajax/testimonials/list.php?status=Approved.
  The backend must return APPROVED testimonials only. Fields used: customer, rating, text, created.
*/
ILE.testimonialCard = (t) => {
  const c = document.createElement('article');
  c.className = 'panel h-100';
  const stars = '★'.repeat(t.rating) + '☆'.repeat(5 - t.rating);
  c.innerHTML =
    '<div class="d-flex align-items-center gap-3 mb-2">' +
    '<span class="avatar avatar-lg"><i class="fa-solid fa-user"></i></span>' +
    '<div><strong class="n"></strong><br /><small class="muted d"></small></div></div>' +
    '<div class="stars" role="img" aria-label="' +
    t.rating +
    ' out of 5 stars">' +
    stars +
    '</div>' +
    '<p class="mt-2 mb-2 tx"></p>' +
    (t.demo ? '<span class="demo-tag">Example</span>' : '');
  c.querySelector('.n').textContent = t.customer || t.name;
  c.querySelector('.d').textContent = t.created || t.date || '';
  c.querySelector('.tx').textContent = t.text;
  return c;
};

ILE.renderTestimonials = (host, list) => {
  host.innerHTML = '';
  if (!list.length) {
    host.innerHTML =
      '<p class="muted text-center">No reviews yet. Be the first after your visit.</p>';
  }
  list.forEach((t) => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.append(ILE.testimonialCard(t));
    host.append(col);
  });
};

ILE.loadApprovedTestimonials = async () => {
  try {
    return (await ILE.api('testimonials/list.php?status=Approved&limit=12')).data;
  } catch (e) {
    return [];
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('tGrid');
  if (grid) ILE.renderTestimonials(grid, await ILE.loadApprovedTestimonials());
});

/* Landing page carousel: centred slides, arrows and dots (Bootstrap carousel does the sliding). */
ILE.testimonialSlide = (t, active) => {
  const item = document.createElement('div');
  item.className = 'carousel-item' + (active ? ' active' : '');
  item.innerHTML =
    '<div class="t-slide">' +
    '<span class="avatar avatar-lg"><i class="fa-solid fa-user"></i></span>' +
    '<div class="stars" role="img" aria-label="' +
    t.rating +
    ' out of 5 stars">' +
    '★'.repeat(t.rating) +
    '☆'.repeat(5 - t.rating) +
    '</div>' +
    '<p class="t-quote"></p><p class="t-name"></p></div>';
  item.querySelector('.t-quote').textContent = '“' + t.text + '”';
  item.querySelector('.t-name').textContent = t.customer || t.name || '';
  return item;
};

document.addEventListener('DOMContentLoaded', async () => {
  const slides = document.getElementById('tSlides');
  if (!slides) return;
  const list = (await ILE.loadApprovedTestimonials()).slice(0, 6);
  const dots = document.getElementById('tDots');

  if (!list.length) {
    slides.innerHTML = '<p class="muted text-center mb-0">Guest reviews will appear here soon.</p>';
    document.querySelectorAll('.t-nav').forEach((b) => (b.hidden = true));
    return;
  }
  list.forEach((t, i) => {
    slides.append(ILE.testimonialSlide(t, i === 0));
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.dataset.bsTarget = '#tCar';
    dot.dataset.bsSlideTo = String(i);
    dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
    if (i === 0) {
      dot.className = 'active';
      dot.setAttribute('aria-current', 'true');
    }
    dots.append(dot);
  });
  if (list.length < 2) {
    document.querySelectorAll('.t-nav').forEach((b) => (b.hidden = true));
    dots.hidden = true;
  }
});
