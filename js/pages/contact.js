/* Contact form -> ajax/contact/submit.php (backend must validate, rate-limit and email). */
document.addEventListener('DOMContentLoaded', () => {
  const f = document.getElementById('contactForm');
  ILE.handleForm(f, 'contact/submit.php', () => {
    f.reset();
    f.classList.remove('was-validated');
  });
});
