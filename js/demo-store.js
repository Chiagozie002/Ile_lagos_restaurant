/*
  DEMO STORE
  ----------
  Pages always call the real ajax/ endpoints first (through ILE.api in main.js).
  ONLY when an endpoint is missing (404/501), offline, or does not return JSON, ILE.api falls back
  to this file, which answers with the same JSON contract using sample data.

  - To switch demo data OFF once your PHP backend works, set ILE_DEMO to false below.
  - A real backend error (valid JSON such as 401/422) is never replaced by demo data.
  - Login, registration and password reset are NEVER faked: they always need the backend.
  - Changes made in demo mode live in sessionStorage only. Nothing is saved to a database.
*/
window.ILE_DEMO = window.ILE_DEMO ?? true; // <-- set to false when the backend is ready

(function () {
  const KEY = 'ile-demo-v1';
  const DEMO_USER = 'Demo Customer'; // the "logged in" customer used on user/ pages
  const NOTE = ' (Demo only: not saved to a database.)';

  /* ---------- small helpers ---------- */
  function seeded(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rnd = seeded(2026);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const between = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const iso = (d) => d.toISOString().slice(0, 10);
  const daysFromNow = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return iso(d);
  };

  /* ---------- seed data ---------- */
  function seed() {
    const dishes = [
      [
        'jollof',
        'Smoky Party Jollof',
        'Mains',
        '₦4,500',
        'Long-simmered tomato rice with a charred smoke finish.',
        ['Rice', 'Tomato', 'Pepper', 'Spices'],
      ],
      [
        'suya',
        'Suya Ribeye',
        'Grill',
        '₦9,800',
        'Thick-cut ribeye rubbed in yaji spice and fire-grilled.',
        ['Beef ribeye', 'Yaji spice', 'Onion'],
      ],
      [
        'pepper',
        'Peppered Snail',
        'Starters',
        '₦6,500',
        'Garlic-butter snails in a bold pepper sauce.',
        ['Snail', 'Garlic', 'Pepper'],
      ],
      [
        'egusi',
        'Egusi & Pounded Yam',
        'Mains',
        '₦7,200',
        'Rich melon-seed stew with assorted proteins.',
        ['Melon seed', 'Leaf', 'Yam'],
      ],
      [
        'plantain',
        'Dodo Gizzard',
        'Starters',
        '₦3,800',
        'Sweet plantain with spiced gizzard.',
        ['Plantain', 'Gizzard'],
      ],
      [
        'chinchin',
        'Chin-Chin Cheesecake',
        'Desserts',
        '₦4,200',
        'Creamy cheesecake over crunchy chin-chin crumb.',
        ['Cream cheese', 'Chin-chin'],
      ],
      [
        'asun',
        'Asun (Spicy Goat)',
        'Grill',
        '₦8,500',
        'Smoked goat chunks tossed in fiery peppers and onion.',
        ['Goat meat', 'Scotch bonnet', 'Onion'],
      ],
      [
        'peppersoup',
        'Catfish Pepper Soup',
        'Starters',
        '₦6,000',
        'Aromatic broth with fresh catfish and warm spices.',
        ['Catfish', 'Pepper soup spice', 'Scent leaf'],
      ],
      [
        'moimoi',
        'Moi Moi Royale',
        'Starters',
        '₦3,500',
        'Steamed bean pudding with egg and fish.',
        ['Beans', 'Egg', 'Fish', 'Pepper'],
      ],
      [
        'tilapia',
        'Grilled Tilapia',
        'Grill',
        '₦9,200',
        'Whole tilapia, charcoal grilled with lemon and herbs.',
        ['Tilapia', 'Lemon', 'Herbs'],
      ],
      [
        'zobo',
        'Zobo Cooler',
        'Drinks',
        '₦1,800',
        'Chilled hibiscus drink with ginger and pineapple.',
        ['Hibiscus', 'Ginger', 'Pineapple'],
      ],
      [
        'puff',
        'Puff-Puff & Ice Cream',
        'Desserts',
        '₦3,900',
        'Warm puff-puff served with vanilla ice cream.',
        ['Flour', 'Sugar', 'Vanilla ice cream'],
      ],
    ].map((d, i) => ({
      id: d[0],
      name: d[1],
      category: d[2],
      price: d[3],
      desc: d[4],
      ingredients: d[5],
      image: `assets/images/menu/${d[0]}.svg`,
      images: [`assets/images/menu/${d[0]}.svg`, `assets/images/menu/${d[0]}-2.svg`],
      status: i === 8 ? 'Hidden' : 'Available',
    }));

    const people = [
      'Adaeze Okafor',
      'Tunde Bakare',
      'Ngozi Eze',
      'Ibrahim Musa',
      'Funke Adeyemi',
      'Chidi Nwosu',
      'Amaka Obi',
      'Seyi Ogunleye',
      'Halima Bello',
      'Emeka Okoro',
      'Kemi Balogun',
      'David Etim',
      'Zainab Lawal',
      DEMO_USER,
    ];
    const email = (n) =>
      n
        .toLowerCase()
        .replace(/[^a-z ]/g, '')
        .replace(' ', '.') + '@example.com';

    const customers = people.map((n, i) => ({
      id: 'c' + (i + 1),
      name: n,
      email: email(n),
      phone: '+234 80' + between(1, 9) + ' ' + between(100, 999) + ' ' + between(1000, 9999),
      joined: daysFromNow(-between(10, 220)),
      status: i === 11 ? 'Deactivated' : 'Active',
    }));

    const times = ['12:30', '13:00', '18:00', '19:00', '19:30', '20:00', '20:30'];
    const reservations = [];
    for (let i = 0; i < 40; i++) {
      const offset = between(-60, 30);
      const date = daysFromNow(offset);
      let status;
      if (offset >= 0) status = pick(['Pending', 'Pending', 'Approved', 'Approved', 'Cancelled']);
      else status = pick(['Completed', 'Completed', 'Completed', 'Declined', 'Cancelled']);
      const submittedOffset = Math.min(-between(0, 14), offset - 1);
      reservations.push({
        id: 'r' + (i + 1),
        reference: 'ILE-2026-' + (1001 + i),
        customer: i % 6 === 0 ? DEMO_USER : pick(people),
        date,
        time: pick(times),
        guests: between(2, 8),
        status,
        submitted: daysFromNow(submittedOffset),
        notes: pick([
          '',
          '',
          'Window seat please',
          'Birthday dinner',
          'Allergy note to confirm by phone',
          'Quiet table',
        ]),
      });
    }

    const texts = [
      'The suya ribeye was unreal. Smoky, spicy and cooked perfectly.',
      'Lovely atmosphere and the staff made our anniversary special.',
      'Best jollof I have had in Lagos. We are already planning our next visit.',
      'Great service, generous portions and a very relaxed room.',
      'The pepper soup was warming and full of flavour.',
      'Booked for a family dinner. Everyone found something they loved.',
      'Dessert was a delightful surprise. The puff-puff is a must.',
      'Good food and good vibes. Slightly busy on Friday but worth it.',
    ];
    const statuses = [
      'Approved',
      'Approved',
      'Approved',
      'Approved',
      'Approved',
      'Approved',
      'Approved',
      'Approved',
      'Approved',
      'Pending',
      'Pending',
      'Pending',
      'Rejected',
      'Rejected',
    ];
    const testimonials = statuses.map((s, i) => ({
      id: 't' + (i + 1),
      customer: i < 3 ? DEMO_USER : pick(people),
      text: texts[i % texts.length],
      rating: pick([5, 5, 5, 4, 4, 3]),
      created: daysFromNow(-between(2, 90)),
      status: i === 1 ? 'Pending' : s,
      demo: true,
    }));

    const subjects = ['General enquiry', 'Private event', 'Feedback'];
    const msgs = [
      'Hello, do you cater for private birthday parties of around 20 guests?',
      'Is there parking available near the restaurant?',
      'We loved our visit last week. Thank you to the whole team.',
      'Can I book the whole room for a corporate dinner next month?',
      'Do you have vegetarian options on the menu?',
      'What time does the kitchen close on Sundays?',
    ];
    const messages = [];
    for (let i = 0; i < 12; i++) {
      const n = pick(people.slice(0, 13));
      const m = msgs[i % msgs.length];
      messages.push({
        id: 'm' + (i + 1),
        name: n,
        email: email(n),
        subject: pick(subjects),
        message: m,
        preview: m.slice(0, 48) + (m.length > 48 ? '…' : ''),
        created: daysFromNow(-between(0, 40)),
        status: i % 3 === 0 ? 'Handled' : 'Unread',
      });
    }

    const state = {
      dishes,
      customers,
      reservations,
      testimonials,
      messages,
      trash: { menu: [], customers: [], testimonials: [], messages: [], reservations: [] },
    };

    // move a few records to the trash so the Trash page has content
    const toTrash = (listName, type, count) => {
      for (let i = 0; i < count; i++)
        state.trash[type].push({
          rec: state[listName].pop(),
          deleted_at: daysFromNow(-between(1, 9)),
        });
    };
    toTrash('dishes', 'menu', 1);
    toTrash('customers', 'customers', 0);
    toTrash('testimonials', 'testimonials', 2);
    toTrash('messages', 'messages', 2);
    toTrash('reservations', 'reservations', 1);
    return state;
  }

  function load() {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const s = seed();
    save(s);
    return s;
  }
  function save(s) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(s));
    } catch (e) {}
  }

  /* ---------- list helpers (search, filter, paginate with the shared contract) ---------- */
  function paginate(list, params) {
    const q = (params.get('q') || '').toLowerCase();
    let out = list;
    if (q) out = out.filter((x) => Object.values(x).join(' ').toLowerCase().includes(q));
    ['status', 'category'].forEach((f) => {
      if (params.get(f))
        out = out.filter((x) => String(x[f]).toLowerCase() === params.get(f).toLowerCase());
    });
    if (params.get('date')) out = out.filter((x) => x.date === params.get('date'));
    const limit = Math.max(1, parseInt(params.get('limit') || '10', 10));
    const total = out.length;
    const totalPages = Math.ceil(total / limit);
    const page = Math.min(
      Math.max(1, parseInt(params.get('page') || '1', 10)),
      Math.max(totalPages, 1),
    );
    return {
      success: true,
      data: out.slice((page - 1) * limit, page * limit),
      page,
      limit,
      total,
      totalPages,
    };
  }

  const ok = (message, data) => ({ success: true, message: message + NOTE, data: data || {} });
  const label = {
    menu: (r) => r.name,
    customers: (r) => r.name + ' (' + r.email + ')',
    testimonials: (r) => r.customer + ': ' + r.text.slice(0, 40) + '…',
    messages: (r) => r.subject + ' from ' + r.name,
    reservations: (r) => r.reference + ' · ' + r.customer,
  };
  const listFor = {
    menu: 'dishes',
    customers: 'customers',
    testimonials: 'testimonials',
    messages: 'messages',
    reservations: 'reservations',
  };
  const sortNewest = (a, b) => Number(b.id.slice(1)) - Number(a.id.slice(1));

  /* allowed reservation status changes (the backend must enforce the same rules) */
  const TRANSITIONS = {
    Pending: ['Approved', 'Declined', 'Cancelled'],
    Approved: ['Completed', 'Cancelled'],
    Declined: [],
    Cancelled: [],
    Completed: [],
  };

  /* ---------- the fake endpoint router ---------- */
  function handle(path, opts) {
    opts = opts || {};
    const [file, query] = path.split('?');
    const params = new URLSearchParams(query || '');
    const endpoint = file.replace(/\.php$/, '');
    const body = {};
    if (opts.body instanceof FormData)
      opts.body.forEach((v, k) => {
        if (!(v instanceof File)) body[k] = v;
      });

    // authentication is never faked
    if (endpoint.startsWith('auth/'))
      throw new Error(
        'Login and password reset need the PHP backend. Demo mode does not fake them.',
      );

    const s = load();
    const onUserPage = /\/user\//.test(location.pathname);

    switch (endpoint) {
      /* --- menu --- */
      case 'menu/list': {
        const list = paginate(s.dishes, params);
        return list;
      }
      case 'menu/details': {
        const d = s.dishes.find((x) => x.id === params.get('id'));
        if (!d) throw new Error('Dish not found.');
        return { success: true, data: d };
      }
      case 'menu/categories':
        return { success: true, data: [...new Set(s.dishes.map((d) => d.category))] };
      case 'menu/create':
        s.dishes.push({
          id: 'd' + Date.now(),
          name: body.name || 'New dish',
          category: body.category || 'Mains',
          price: '₦' + Number(body.price || 0).toLocaleString(),
          desc: body.description || '',
          ingredients: [],
          image: 'assets/images/menu/jollof.svg',
          images: ['assets/images/menu/jollof.svg'],
          status: body.status || 'Available',
        });
        save(s);
        return ok('Dish saved.');
      case 'menu/update': {
        const d = s.dishes.find((x) => x.id === body.id);
        if (!d) throw new Error('Dish not found.');
        Object.assign(d, {
          name: body.name,
          category: body.category,
          price: body.price,
          status: body.status,
        });
        save(s);
        return ok('Dish updated.');
      }
      case 'menu/delete': {
        const i = s.dishes.findIndex((x) => x.id === body.id);
        if (i < 0) throw new Error('Dish not found.');
        s.trash.menu.push({ rec: s.dishes.splice(i, 1)[0], deleted_at: daysFromNow(0) });
        save(s);
        return ok('Dish moved to Trash.');
      }

      /* --- e-menu (public QR menu): only available dishes --- */
      case 'emenu/list': {
        const available = s.dishes.filter((d) => d.status !== 'Hidden');
        const res = paginate(
          available.map(({ id, name, category, price, desc }) => ({
            id,
            name,
            category,
            price,
            desc,
          })),
          params,
        );
        res.categories = [...new Set(available.map((d) => d.category))];
        return res;
      }

      /* --- reservations --- */
      case 'reservations/list': {
        let list = [...s.reservations].sort(sortNewest);
        if (onUserPage) list = list.filter((r) => r.customer === DEMO_USER);
        return paginate(list, params);
      }
      case 'reservations/details': {
        const r = s.reservations.find((x) => x.id === params.get('id'));
        if (!r) throw new Error('Reservation not found.');
        return { success: true, data: r };
      }
      case 'reservations/create':
        s.reservations.push({
          id: 'r' + (s.reservations.length + 100),
          reference: 'ILE-2026-' + (2000 + s.reservations.length),
          customer: DEMO_USER,
          date: body.date,
          time: body.time,
          guests: Number(body.guests || 2),
          status: 'Pending',
          submitted: daysFromNow(0),
          notes: body.notes || '',
        });
        save(s);
        return ok('Reservation request received. It is awaiting review.');
      case 'reservations/update-status': {
        const r = s.reservations.find((x) => x.id === body.id);
        if (!r) throw new Error('Reservation not found.');
        if (!TRANSITIONS[r.status].includes(body.status))
          throw new Error(
            'A ' + r.status + ' reservation cannot be changed to ' + body.status + '.',
          );
        r.status = body.status;
        save(s);
        return ok('Reservation marked as ' + body.status + '. The customer would be emailed.');
      }
      case 'reservations/cancel':
      case 'reservations/request-change': {
        const r = s.reservations.find((x) => x.id === body.id);
        if (!r) throw new Error('Reservation not found.');
        if (r.status === 'Pending' && endpoint === 'reservations/cancel') {
          r.status = 'Cancelled';
          save(s);
          return ok('Your pending request was cancelled.');
        }
        return ok(
          'Your request was sent to staff. The reservation stays approved until they decide.',
        );
      }
      case 'reservations/update':
        return ok('Reservation updated.');

      /* --- testimonials --- */
      case 'testimonials/list': {
        let list = [...s.testimonials].sort(sortNewest);
        if (params.get('mine') || onUserPage) list = list.filter((t) => t.customer === DEMO_USER);
        return paginate(list, params);
      }
      case 'testimonials/create':
        s.testimonials.push({
          id: 't' + (s.testimonials.length + 100),
          customer: DEMO_USER,
          text: body.text,
          rating: Number(body.rating || 5),
          created: daysFromNow(0),
          status: 'Pending',
          demo: true,
        });
        save(s);
        return ok('Thank you. Your review will appear after approval.');
      case 'testimonials/update': {
        const t = s.testimonials.find((x) => x.id === body.id);
        if (!t) throw new Error('Testimonial not found.');
        t.text = body.text;
        t.rating = Number(body.rating);
        t.status = 'Pending'; // edits always return to review
        save(s);
        return ok('Updated. It will be shown publicly again after approval.');
      }
      case 'testimonials/moderate': {
        const t = s.testimonials.find((x) => x.id === body.id);
        if (!t) throw new Error('Testimonial not found.');
        t.status = body.action === 'approve' ? 'Approved' : 'Rejected';
        save(s);
        return ok('Testimonial ' + t.status.toLowerCase() + '.');
      }
      case 'testimonials/delete': {
        const i = s.testimonials.findIndex((x) => x.id === body.id);
        if (i < 0) throw new Error('Testimonial not found.');
        s.trash.testimonials.push({
          rec: s.testimonials.splice(i, 1)[0],
          deleted_at: daysFromNow(0),
        });
        save(s);
        return ok('Testimonial moved to Trash.');
      }

      /* --- contact --- */
      case 'contact/submit':
        s.messages.push({
          id: 'm' + (s.messages.length + 100),
          name: body.name,
          email: body.email,
          subject: body.subject,
          message: body.message,
          preview: (body.message || '').slice(0, 48),
          created: daysFromNow(0),
          status: 'Unread',
        });
        save(s);
        return ok('Message sent. We will reply by email.');
      case 'contact/list':
        return paginate([...s.messages].sort(sortNewest), params);
      case 'contact/update-status': {
        const i = s.messages.findIndex((x) => x.id === body.id);
        if (i < 0) throw new Error('Message not found.');
        if (body.status === 'deleted')
          s.trash.messages.push({ rec: s.messages.splice(i, 1)[0], deleted_at: daysFromNow(0) });
        else s.messages[i].status = 'Handled';
        save(s);
        return ok('Message updated.');
      }

      /* --- customers --- */
      case 'customers/list': {
        const list = s.customers.map((c) => ({
          ...c,
          reservations: s.reservations.filter((r) => r.customer === c.name).length,
        }));
        return paginate(list, params);
      }
      case 'customers/details':
        return { success: true, data: s.customers.find((x) => x.id === params.get('id')) };
      case 'customers/deactivate': {
        const c = s.customers.find((x) => x.id === body.id);
        if (!c) throw new Error('Customer not found.');
        c.status = 'Deactivated';
        save(s);
        return ok('Customer deactivated. Reservation history is kept.');
      }

      /* --- profile (no data is stored) --- */
      case 'profile/get':
        return {
          success: true,
          data: { name: DEMO_USER, email: email(DEMO_USER), phone: '+234 800 000 0000' },
        };
      case 'profile/update':
      case 'profile/upload-image':
      case 'profile/change-password':
        return ok('Saved.');

      /* --- analytics (calculated from the demo records) --- */
      case 'analytics/overview':
        return {
          success: true,
          data: {
            menuItems: s.dishes.length,
            reservations: s.reservations.length,
            pendingReservations: s.reservations.filter((r) => r.status === 'Pending').length,
            customers: s.customers.length,
            pendingTestimonials: s.testimonials.filter((t) => t.status === 'Pending').length,
            unreadMessages: s.messages.filter((m) => m.status === 'Unread').length,
          },
        };
      case 'analytics/reservations': {
        const range = parseInt(params.get('range') || '30', 10);
        const monthly = range > 90;
        const buckets = monthly ? 12 : Math.ceil(range / 7);
        const labels = [];
        const values = new Array(buckets).fill(0);
        const now = new Date();
        for (let b = 0; b < buckets; b++) {
          const d = new Date(now);
          if (monthly) d.setMonth(d.getMonth() - (buckets - 1 - b));
          else d.setDate(d.getDate() - (buckets - 1 - b) * 7);
          labels.push(
            d.toLocaleDateString(
              'en',
              monthly ? { month: 'short' } : { month: 'short', day: 'numeric' },
            ),
          );
        }
        s.reservations.forEach((r) => {
          const ageDays = (now - new Date(r.submitted)) / 86400000;
          if (ageDays < 0 || ageDays > (monthly ? 365 : buckets * 7)) return;
          const idx = buckets - 1 - Math.floor(ageDays / (monthly ? 30 : 7));
          if (idx >= 0) values[idx] += 1;
        });
        const names = ['Pending', 'Approved', 'Declined', 'Cancelled', 'Completed'];
        return {
          success: true,
          data: {
            trend: { labels, values },
            status: {
              labels: names,
              values: names.map((n) => s.reservations.filter((r) => r.status === n).length),
            },
          },
        };
      }

      /* --- trash --- */
      case 'trash/list': {
        const t = params.get('type');
        return {
          success: true,
          data: (s.trash[t] || []).map((x) => ({
            id: x.rec.id,
            label: label[t](x.rec),
            deleted_at: x.deleted_at,
          })),
        };
      }
      case 'trash/restore': {
        const arr = s.trash[body.type] || [];
        const i = arr.findIndex((x) => x.rec.id === body.id);
        if (i < 0) throw new Error('Record not found in trash.');
        s[listFor[body.type]].push(arr.splice(i, 1)[0].rec);
        save(s);
        return ok('Record restored.');
      }
      case 'trash/restore-all': {
        const arr = s.trash[body.type] || [];
        const n = arr.length;
        arr.splice(0).forEach((x) => s[listFor[body.type]].push(x.rec));
        save(s);
        return ok(n + ' record(s) restored.');
      }
      case 'trash/delete-permanently': {
        const arr = s.trash[body.type] || [];
        const i = arr.findIndex((x) => x.rec.id === body.id);
        if (i < 0) throw new Error('Record not found in trash.');
        arr.splice(i, 1);
        save(s);
        return ok('Record permanently deleted.');
      }
      case 'trash/empty': {
        const n = (s.trash[body.type] || []).length;
        s.trash[body.type] = [];
        save(s);
        return ok(n + ' record(s) permanently deleted.');
      }
    }
    throw new Error('This endpoint is not implemented yet.');
  }

  window.ILE = window.ILE || {};
  ILE.demo = { handle };
})();
