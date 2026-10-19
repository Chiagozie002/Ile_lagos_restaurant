<?php
/**
 * ENDPOINT STUB (NOT IMPLEMENTED): ajax/emenu/qrcode.php
 *
 * Purpose:  Produce the QR code IMAGE that opens the guest e-menu page (cpanel/e_menu/index.html).
 *           It is shown on the admin Overview page (cpanel/index.html) in <img class="qr-img" src="../ajax/emenu/qrcode.php">.
 * Method:   GET   Input (optional): size = 300 | 600 | 1000 (whitelist), download = 1 (offer the PNG as a file)
 * Auth:     ADMIN ONLY (check the admin session). The e-menu page itself stays public.
 * Response: a PNG image (Content-Type: image/png), NOT JSON. On failure send a plain 4xx/5xx with no details.
 *
 * TODO LIST: how to build the QR code
 *  [ ] 1. Decide the public URL the QR must open, e.g. https://yourdomain.com/cpanel/e_menu/index.html
 *         Keep it in ONE config constant (EMENU_URL). Shorter URLs make simpler, easier-to-scan codes.
 *         (Tip: you may later move the page to /menu/ or add a short redirect, then update only the constant.)
 *  [ ] 2. Install a QR library with Composer, for example:   composer require endroid/qr-code
 *         (alternatives: chillerlan/php-qrcode, or the single-file "phpqrcode" library)
 *  [ ] 3. Generate the code: data = EMENU_URL, error-correction level Q or H, size from the whitelist (default 600),
 *         margin (quiet zone) of at least 4 modules, dark modules on a white background (best for scanners).
 *         Optional: put a small logo in the centre only with level H.
 *  [ ] 4. Output it: header('Content-Type: image/png'); header('Cache-Control: private, max-age=86400'); echo $png;
 *         If ?download=1, also send: Content-Disposition: attachment; filename="ile-emenu-qr.png"
 *  [ ] 5. Cache the PNG on disk (e.g. /uploads/qr/emenu-600.png) and regenerate it only when EMENU_URL changes.
 *  [ ] 6. Check the admin session first (same check as your other admin endpoints); return 403 otherwise.
 *  [ ] 7. Test: open the Overview page, scan the code with a phone, confirm the e-menu opens, and test printed sizes
 *         (table card size should be at least 3 x 3 cm).
 *  [ ] 8. Do NOT encode secrets or session tokens in the QR code. It is public by design.
 *  [ ] 9. Optional: add a "Download QR" button on the Overview page that links to qrcode.php?size=1000&download=1 for printing.
 *
 * Until this is built, the Overview page shows assets/images/placeholders/qr-placeholder.svg (a decorative, non-scannable picture).
 */
http_response_code(501);
header('Content-Type: text/plain');
echo 'This endpoint is not implemented yet.';
