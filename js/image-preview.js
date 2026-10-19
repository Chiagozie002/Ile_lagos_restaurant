/*
  Image previews (auto-initialised, no setup needed)
  1) [data-avatar-uploader]  one profile picture: shows the saved picture, previews a new one, Reset goes back.
  2) [data-multi-uploader]   up to data-max images (default 3) in slots, each with a remove button.
  The browser only previews. The PHP backend must validate type, size and content again.
*/
(function () {
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_BYTES = 2 * 1024 * 1024; // 2 MB each

  const warn = (message) => (window.ILE ? ILE.toast(message, 'warning') : alert(message));
  const problem = (file) => {
    if (!ALLOWED.includes(file.type)) return 'Use a JPG, PNG or WebP image.';
    if (file.size > MAX_BYTES) return 'Each image must be under 2 MB.';
    return '';
  };

  /* ---------- 1. single profile picture ---------- */
  function initAvatar(root) {
    const input = root.querySelector('input[type=file]');
    const box = root.querySelector('.avatar-preview');
    const img = box.querySelector('img');
    const icon = box.querySelector('i');
    const label = root.querySelector('[data-file-name]');
    const reset = root.querySelector('[data-reset]');
    const frame = root.querySelector('.avatar-uploader') || root; // gets the "changed" highlight
    const saved = box.dataset.current || ''; // PHP: put the saved picture URL in data-current
    let blob = '';

    const show = (src) => {
      if (src) {
        img.src = src;
        img.hidden = false;
        icon.hidden = true;
      } else {
        img.removeAttribute('src');
        img.hidden = true;
        icon.hidden = false;
      }
    };
    show(saved);

    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      const error = problem(file);
      if (error) {
        input.value = '';
        return warn(error);
      }
      if (blob) URL.revokeObjectURL(blob);
      blob = URL.createObjectURL(file);
      show(blob);
      label.textContent = file.name;
      frame.classList.add('changed');
    });

    reset.addEventListener('click', () => {
      input.value = '';
      if (blob) URL.revokeObjectURL(blob);
      blob = '';
      show(saved);
      label.textContent = '';
      frame.classList.remove('changed');
    });
    const form = root.closest('form');
    if (form) form.addEventListener('reset', () => reset.click());
  }

  /* ---------- 2. several images in slots (product form) ---------- */
  function initMulti(root) {
    const max = parseInt(root.dataset.max || '3', 10);
    const input = root.querySelector('input[type=file]');
    const grid = root.querySelector('.img-slots');
    const count = root.querySelector('[data-count]');
    let files = [];
    let urls = [];

    // keep the real <input> in step with our list so the form submits exactly what is previewed
    const sync = () => {
      const dt = new DataTransfer();
      files.forEach((f) => dt.items.add(f));
      input.files = dt.files;
    };

    const add = (list) => {
      [...list].forEach((file) => {
        const error = problem(file);
        if (error) return warn(error);
        if (files.length >= max) return warn('You can add up to ' + max + ' images.');
        files.push(file);
      });
      sync();
      render();
    };

    function render() {
      urls.forEach((u) => URL.revokeObjectURL(u));
      urls = [];
      grid.innerHTML = '';
      for (let i = 0; i < max; i++) {
        const slot = document.createElement('div');
        slot.className = 'img-slot' + (files[i] ? ' filled' : '');
        if (files[i]) {
          const url = URL.createObjectURL(files[i]);
          urls.push(url);
          slot.innerHTML =
            '<img alt="Preview of image ' +
            (i + 1) +
            '" />' +
            '<span class="slot-tag">' +
            (i === 0 ? 'Main image' : 'Image ' + (i + 1)) +
            '</span>' +
            '<button type="button" class="slot-remove" aria-label="Remove image ' +
            (i + 1) +
            '"><i class="fa-solid fa-xmark"></i></button>';
          slot.querySelector('img').src = url;
          slot.querySelector('.slot-remove').addEventListener('click', () => {
            files.splice(i, 1);
            sync();
            render();
          });
        } else {
          slot.innerHTML =
            '<button type="button" class="slot-add"><i class="fa-solid fa-plus"></i><span>' +
            (i === 0 ? 'Main image' : 'Add image') +
            '</span></button>';
          slot.querySelector('.slot-add').addEventListener('click', () => input.click());
        }
        grid.append(slot);
      }
      if (count) count.textContent = files.length + ' of ' + max + ' images';
    }

    input.addEventListener('change', () => {
      const picked = [...input.files];
      files = files.filter(Boolean);
      add(picked);
    });
    grid.addEventListener('dragover', (e) => e.preventDefault());
    grid.addEventListener('drop', (e) => {
      e.preventDefault();
      add(e.dataTransfer.files);
    });
    const form = root.closest('form');
    if (form)
      form.addEventListener('reset', () => {
        files = [];
        sync();
        render();
      });
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-avatar-uploader]').forEach(initAvatar);
    document.querySelectorAll('[data-multi-uploader]').forEach(initMulti);
  });
})();
