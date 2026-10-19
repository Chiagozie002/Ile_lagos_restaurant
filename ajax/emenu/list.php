<?php
/**
 * ENDPOINT STUB (NOT IMPLEMENTED): ajax/emenu/list.php
 *
 * Purpose:  Public list of dishes for the guest e-menu page (cpanel/e_menu/index.html), opened from the QR code.
 * Method:   GET   Input (query string): page (default 1), limit (default 8, max 50), q (search text), category
 * Auth:     NONE. This is a public, read-only endpoint. Never return private or admin-only fields.
 * Response: {"success":true,"data":[{"id":1,"name":"","category":"","price":"₦4,500","desc":""}],
 *            "categories":["Grill","Mains"],"page":1,"limit":8,"total":0,"totalPages":0}
 *          
 *
 * TODO LIST
 *  [ ] 1. Read and clamp the inputs: page >= 1, 1 <= limit <= 50, trim q (max 60 chars), category (max 40 chars).
 *  [ ] 2. Query ONLY visible dishes with a PREPARED statement, for example:
 *         SELECT id, name, category, price, description AS `desc`
 *         FROM menu_items
 *         WHERE deleted_at IS NULL AND status = 'Available'
 *           AND (:q = '' OR name LIKE :like OR description LIKE :like)
 *           AND (:category = '' OR category = :category)
 *         ORDER BY category, name
 *         LIMIT :limit OFFSET :offset
 *  [ ] 3. Run a matching COUNT(*) query (same WHERE) for total, then totalPages = ceil(total / limit).
 *  [ ] 4. Return "categories": SELECT DISTINCT category FROM menu_items WHERE deleted_at IS NULL AND status = 'Available' ORDER BY category.
 *         (Always the FULL list, not only the filtered one, so the filter chips stay stable.)
 *  [ ] 5. Escape nothing here (return raw JSON); the page escapes text when it renders.
 *  [ ] 6. Send header('Content-Type: application/json') and a short cache, e.g. Cache-Control: public, max-age=60.
 *  [ ] 7. Add basic rate limiting per IP (the page is public) and log errors safely (no SQL or PHP errors in the response).
 *  [ ] 8. IMPORTANT: if your PHP guards everything under /cpanel/ with the admin login, EXCLUDE /cpanel/e_menu/ from that guard.
 *         Guests are not logged in.
 *  [ ] 9. When this works, set window.ILE_DEMO = false in js/demo-store.js so demo data never appears in production.
 */
header('Content-Type: application/json');
http_response_code(501);
echo json_encode(['success' => false, 'message' => 'This endpoint is not implemented yet.', 'errors' => new stdClass()]);
