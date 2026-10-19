<?php
/**
 * ENDPOINT STUB (NOT IMPLEMENTED): ajax/menu/details.php
 * Purpose:   Single dish with up to 3 images
 * Method:    GET   Input: id
 * Auth:      public  (enforce on the server; JavaScript is not security)
 * DB:        prepared statements only. TODO: implement queries.
 * Success:   {"success":true,"message":"...","data":{}}  (lists add page,limit,total,totalPages)
 * Errors:    {"success":false,"message":"...","errors":{}}  401 not logged in, 403 forbidden, 422 validation
 * Security:  server-side validation, CSRF token for state changes, escape output, never expose SQL/PHP errors, rate-limit.
 * Emails:    trigger from here where relevant; never send from the frontend.
 */
header('Content-Type: application/json');
http_response_code(501);
echo json_encode(['success' => false, 'message' => 'This endpoint is not implemented yet.', 'errors' => new stdClass()]);
