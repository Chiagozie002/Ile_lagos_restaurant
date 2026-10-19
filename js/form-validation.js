/* Shared form helper: validates, blocks duplicate submits, shows loading, posts via fetch, reports ONLY server-confirmed success. */
ILE.handleForm = (form, endpoint, onSuccess) => {
  const btn = form.querySelector('[type=submit]');
  let busy = false;
  form.setAttribute('novalidate', '');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    form.classList.add('was-validated');
    if (!form.checkValidity()) {
      form.querySelector(':invalid')?.focus();
      return ILE.toast('Please fix the highlighted fields.', 'warning');
    }
    busy = true;
    btn.disabled = true;
    const label = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending…';
    try {
      // FormData: PHP reads it from $_POST. Backend must validate again and enforce auth.
      const res = await ILE.api(endpoint, { method: 'POST', body: new FormData(form) });
      ILE.toast(res.message || 'Done.', 'success');
      onSuccess?.(res);
    } catch (err) {
      const unauth = /please log in|not logged in|unauthori[sz]ed/i.test(err.message);
      ILE.toast(
        unauth
          ? 'Please log in to continue.'
          : 'Not sent: ' + err.message + ' (the PHP endpoint may not be implemented yet)',
        unauth ? 'warning' : 'error',
      );
    } finally {
      busy = false;
      btn.disabled = false;
      btn.innerHTML = label;
    }
  });
};
