<?php
/**
 * ENDPOINT STUB (NOT IMPLEMENTED): ajax/reservations/update.php
 * Purpose:   Edit own PENDING reservation only
 * Method:    POST   Input: form
 * Auth:      customer  (enforce on the server; JavaScript is not security)
 * DB:        prepared statements only. TODO: implement queries.
 * Success:   {"success":true,"message":"...","data":{}}  (lists add page,limit,total,totalPages)
 * Errors:    {"success":false,"message":"...","errors":{}}  401 not logged in, 403 forbidden, 422 validation
 * Security:  server-side validation, CSRF token for state changes, escape output, never expose SQL/PHP errors, rate-limit.
 * Emails:    trigger from here where relevant; never send from the frontend.
 */
header('Content-Type: application/json');
http_response_code(501);
echo json_encode(['success' => false, 'message' => 'This endpoint is not implemented yet.', 'errors' => new stdClass()]);
