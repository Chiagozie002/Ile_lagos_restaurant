/* Auth pages: password toggle, OTP inputs, resend cooldown, form->endpoint wiring. Never store passwords/OTPs/tokens in storage. */
document.addEventListener('DOMContentLoaded', () => {
  // Sparse stars (kept few for low-end phones)
  const g = document.querySelector('.galaxy');
  for (let i = 0; i < 24; i++) {
    const s = document.createElement('i');
    s.className = 'star';
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${Math.random() * 6}s`;
    g.append(s);
  }
  // Password visibility
  document.querySelectorAll('.pw button').forEach(
    (b) =>
      (b.onclick = () => {
        const i = b.parentElement.querySelector('input');
        const show = i.type === 'password';
        i.type = show ? 'text' : 'password';
        b.querySelector('i').className = 'fa-solid ' + (show ? 'fa-eye-slash' : 'fa-eye');
        b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      }),
  );
  // OTP: auto-advance, backspace, paste
  const boxes = [...document.querySelectorAll('.otp input')],
    hidden = document.getElementById('otpValue');
  const sync = () => {
    if (hidden) hidden.value = boxes.map((b) => b.value).join('');
  };
  boxes.forEach((b, i) => {
    b.oninput = () => {
      b.value = b.value.replace(/\D/g, '').slice(-1);
      sync();
      if (b.value && boxes[i + 1]) boxes[i + 1].focus();
    };
    b.onkeydown = (e) => {
      if (e.key === 'Backspace' && !b.value && boxes[i - 1]) boxes[i - 1].focus();
    };
    b.onpaste = (e) => {
      e.preventDefault();
      const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, boxes.length);
      [...t].forEach((c, k) => (boxes[k].value = c));
      sync();
      boxes[Math.min(t.length, boxes.length) - 1]?.focus();
    };
  });
  // Resend cooldown (UI only; backend must enforce real limits)
  const rs = document.getElementById('resend');
  if (rs) {
    const run = () => {
      let n = 30;
      rs.disabled = true;
      const t = setInterval(() => {
        rs.textContent = `Resend code in ${--n}s`;
        if (n <= 0) {
          clearInterval(t);
          rs.disabled = false;
          rs.textContent = 'Resend code';
        }
      }, 1000);
    };
    rs.onclick = async () => {
      try {
        await ILE.api(rs.dataset.endpoint, { method: 'POST' });
        ILE.toast('A new code was requested.', 'success');
      } catch (e) {
        ILE.toast('Could not resend: ' + e.message, 'error');
      }
      run();
    };
    run();
  }
  // Forms: data-endpoint + data-next (redirect only after server success)
  document.querySelectorAll('form[data-endpoint]').forEach((f) =>
    ILE.handleForm(f, f.dataset.endpoint, () => {
      if (f.dataset.next) location.href = f.dataset.next;
    }),
  );
  // Confirm-password match
  const pw2 = document.getElementById('confirm');
  if (pw2)
    pw2.oninput = () =>
      pw2.setCustomValidity(
        pw2.value === document.getElementById('password').value ? '' : 'Passwords do not match',
      );
});
