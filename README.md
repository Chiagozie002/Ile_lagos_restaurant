# ILE Lagos Chophouse — frontend (all 3 stages)
Run locally: `python3 -m http.server` in this folder, open `http://localhost:8000/`. (Needs internet for CDN fonts/Bootstrap/Font Awesome/Chart.js.)

## Stack
HTML5, CSS3, vanilla JS, Bootstrap 5.3.3, Font Awesome 6.5.2 (swap the CDN URL for v7 in each page head), Sora/Inter/Marcellus, Chart.js 4.4.3 (analytics page only).

## Structure
`index.html`, `pages/` (public), `auth/` (customer login flow), `user/` (customer area), `cpanel/` (admin + admin auth), `css/` (`main.css` tokens/components, `auth.css`, `admin-dashboard.css`), `js/` (`main.js` theme/preloader/toast/dropdown/api helper, `form-validation.js`, `auth.js`, `user-dashboard.js`, `admin-dashboard.js`, `testimonials.js`, `demo-data.js`, `pages/*`), `ajax/` (PHP stubs, lowercase).
Repeated blocks are wrapped in `START/END` comments (public navbar/footer, admin sidebar/top nav) so you can turn them into PHP includes.

## Theme
`data-theme` on `<html>`, saved as `ile-theme` in localStorage, set by an inline script in `<head>` to avoid a flash. Colours live in `css/main.css`. Auth pages are always dark.

## Replace content
- Hero photos: edit the `src` of the `<img class="hero-slide">` tags at the top of `index.html` (add or remove slides freely). Dish photos: edit `image` / `images` (max 3) in `js/demo-data.js`, and the `src` of the 3 featured cards in `index.html`. The included SVG pictures are illustrated stand-ins, not photographs.
- Contact details, hours, social links: the footer, `pages/contact.html` and the reservations note currently hold SAMPLE details (12 Admiralty Way, +234 801 234 5678, hello@ilelagoschophouse.com, sample hours); search for them to replace. Social links are still `href="#"` in `pages/contact.html` and the footer block.
- Demo menu/testimonials: `js/demo-data.js`, `js/testimonials.js`, and the inline data in `pages/menu.html`. Replace with `ajax/menu/list.php` / `ajax/testimonials/list.php`.

## Navbar and PHP sessions
The Login button is commented out in the navbar (uncomment for guests). The customer profile dropdown (Dashboard, My Reservations, My Profile, Settings, My Testimonials, Logout) is always in the source; show/hide it in PHP. Logout calls `ajax/auth/customer/logout.php` and redirects only on server success.

## Ajax contract
All calls go through `ILE.api(path)` in `js/main.js`, which prefixes `window.ILE_ROOT + 'ajax/'`.
Success: `{"success":true,"message":"","data":{}}`. Error: `{"success":false,"message":"","errors":{}}`. Lists add `page, limit, total, totalPages`. Forms send `FormData`. Each file in `ajax/` documents its method, input, auth, DB work and security needs and returns HTTP 501 until you implement it.

## Hosting in a subdirectory
Pages use relative paths. Each page sets `window.ILE_ROOT` (`""`, `"../"`) in its head; keep it pointing at the project root.

## Backend TODOs and security
Prepared statements, server-side validation, role checks and ownership checks on every endpoint, CSRF tokens, secure sessions with ID regeneration, OTP expiry and rate limits, no account enumeration, upload validation (MIME, size, max 3 dish images), output escaping, soft deletes (`deleted_at`, `deleted_by`), reservation status transition rules (Pending, Approved, Declined, Cancelled, Completed; approved reservations stay approved until staff approve a change), testimonial edits return to Pending, email notifications from PHP only. Never put secrets in JS.

## Status
Frontend-built: all pages listed above. Demo-only: dish and testimonial samples (labelled). Backend-pending: every `ajax/` endpoint, auth, emails, uploads, analytics data.
Legal pages are drafts and need legal review. No performance score has been measured.

## QA log (automated, headless Chromium)
34 pages x 5 viewports (360, 390, 768, 1366, 1920): no horizontal overflow, no JS console errors (404/501 from missing PHP excluded). 56 interaction checks pass (theme toggle and persistence, offcanvas, dropdown, logout modal, hero rotation, menu search/filter/pagination, product page, forms, toast de-dupe, auth always-dark, admin modals/states).
Known test limits: Google Fonts were blocked in the test sandbox, so fallback fonts were used; real devices, Safari/Firefox, screen readers and Lighthouse were not tested. No performance score is claimed.

## Editing notes
All HTML, CSS and JS are formatted with Prettier (config in `.prettierrc`): one element per line, indented, blank lines between sections, so you can drop PHP loops and conditions between elements. To keep it that way: `npx prettier --write "**/*.{html,css,js}"`.
Theme toggle: markup in each page (`#themeToggle.theme-toggle`), styles in `css/main.css` (section "Desktop theme toggle"), logic in `js/main.js`.

## About page
Map: edit the `src` of the `<iframe>` in `pages/about.html` (Google Maps > Share > Embed a map), and the `query=` address in the Get directions link. All About text is sample copy meant to be edited directly.

## Demo data (so the site looks full before the backend exists)
Every page calls the real `ajax/` endpoint first through `ILE.api()` (`js/main.js`). Only if the endpoint is missing (404/501), offline, or not JSON does it fall back to ``js/demo-store.js`, which answers with the same JSON contract (lists use `{success,data,page,limit,total,totalPages}`).
- Turn demo data OFF when your PHP works: set `window.ILE_DEMO = false` at the top of `js/demo-store.js` (and you can delete the file and its `<script>` tags).
- A real backend reply (valid JSON, including 401/422 errors) is never replaced by demo data.
- Demo changes (approve a reservation, edit a dish, move to Trash, restore) live in `sessionStorage` only, and success messages say "Demo only: not saved to a database". Reservation status rules are enforced in the demo too.
- Login, registration and password reset are never faked; they need your backend.
- Edit the sample dishes, people, reservations, reviews and messages inside `seed()` in `js/demo-store.js`. Dish photos: `image` / `images` fields there.

## Product details page
`pages/product-details.html` is a STATIC design of one dish with `<!-- PHP: ... -->` markers where the name, price, description, images, ingredients and related dishes go. Menu and home cards link to it as `product-details.html?id=<dish id>`; read that id in PHP. `js/pages/product-details.js` only swaps the gallery image on thumbnail click.

## Maps
About and Contact pages use an OpenStreetMap embed (no API key). Replace the iframe `src` to change the location (OpenStreetMap: Share > HTML, or Google Maps: Share > Embed a map).

## Profile trigger
Customer and admin menus show an avatar, the first name and a dropdown arrow (name hidden on phones). Edit the `<span class="pname">` text; output the real first name with PHP. The current page is highlighted in the dropdown automatically.

## E-menu (QR menu for guests) — `cpanel/e_menu/index.html`
A public, dark-only menu page for guests at the table: brand on the left, "Visit website" on the right, a search box, category chips, a responsive table (Dish, Category, Price) and pagination. It is not a shopping cart.
- Data: `ajax/emenu/list.php` (public GET: `page, limit, q, category`) returning the usual list contract plus `categories`. Until that endpoint exists the demo fallback in `js/demo-store.js` answers (only "Available" dishes). If the request fails and demo data is off, the page shows a friendly error with a retry button.
- Files: `cpanel/e_menu/index.html`, `css/e-menu.css`, `js/e-menu.js`.
- The admin Overview page (`cpanel/index.html`) has an "e-menu" panel next to Quick actions with the QR image, a "Visit the e-menu" link and a "Copy link" button. The image `src` is `ajax/emenu/qrcode.php`; until you build it a decorative placeholder (not scannable) is shown.
- **Important:** if your PHP protects everything under `/cpanel/` with the admin login, exclude `/cpanel/e_menu/` so guests can open it.

### How to build the QR code (backend TODO) — details are in `ajax/emenu/qrcode.php`
1. Pick the public URL the QR must open (e.g. `https://yourdomain.com/cpanel/e_menu/index.html`) and keep it in one constant.
2. `composer require endroid/qr-code` (or chillerlan/php-qrcode / phpqrcode).
3. Generate a PNG: error correction Q or H, size 300/600/1000, quiet zone of at least 4 modules, dark on white.
4. Output it with `Content-Type: image/png` (and `Content-Disposition` when `?download=1`); cache it on disk and regenerate only when the URL changes.
5. Admin-only endpoint (check the admin session). Never encode secrets in the QR.
6. Scan it with a phone and test the printed size (at least about 3 x 3 cm) before putting cards on tables.
7. Implement `ajax/emenu/list.php` (see its TODO list), then set `window.ILE_DEMO = false` in `js/demo-store.js`.

## Image previews
`js/image-preview.js` auto-initialises: `[data-avatar-uploader]` (customer and admin profile: shows the saved picture from `data-current`, previews a new one, Reset restores it) and `[data-multi-uploader]` (add-product: three image slots with remove buttons and drag and drop). PHP must still validate every upload.

## Logo and favicon
Supplied artwork was cut out of its black background into transparent PNGs in `assets/images/branding/`:
- `logo-lockup-light.png` (dark text, for light backgrounds) and `logo-lockup-dark.png` (cream text, for dark backgrounds). The public navbar swaps them with the theme (`.logo-for-light` / `.logo-for-dark`).
- `logo-stacked-dark.png` (monogram + name) is used in the preloader. `logo-mark-*.png` is the monogram alone, ready for any small spot.
- The footer, preloader, auth pages, admin sidebar and e-menu always use the dark-background versions.
- The tagline is live text (not part of the stacked artwork), because the tagline in the supplied branding sheet has a rendering glitch ("UNFORGE?TABLE"). The horizontal logo file has a clean tagline if you want to use that one instead.
- Favicon files are in `assets/icons/` (`favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`) and are linked in every page head. Replace the files to change the icon.
- For social sharing add an absolute `og:image` URL once the domain is known.

## User menu
On phones (<= 575px) the profile dropdown opens as a full-width card under the bar with a dimmed page behind it (`.menu-backdrop`), larger rows and the current page highlighted. On larger screens it stays an anchored dropdown. Logic: `js/main.js`; styles: end of `css/main.css`.
