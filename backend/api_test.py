"""Comprehensive API endpoint test script for Phase 1."""
import requests
import json
import sys
import io
import subprocess
import time
import struct

def make_jpeg():
    return bytes([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
        0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
        0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
        0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C,
        0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D,
        0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
        0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
        0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34,
        0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4,
        0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
        0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
        0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0xFF,
        0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03,
        0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04,
        0x00, 0x00, 0x01, 0x7D, 0x01, 0x02, 0x03, 0x00,
        0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
        0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32,
        0x81, 0x91, 0xA1, 0x08, 0x23, 0x42, 0xB1, 0xC1,
        0x15, 0x52, 0xD1, 0xF0, 0x24, 0x33, 0x62, 0x72,
        0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A,
        0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x34, 0x35,
        0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45,
        0x46, 0x47, 0x48, 0x49, 0x4A, 0x53, 0x54, 0x55,
        0x56, 0x57, 0x58, 0x59, 0x5A, 0x63, 0x64, 0x65,
        0x66, 0x67, 0x68, 0x69, 0x6A, 0x73, 0x74, 0x75,
        0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85,
        0x86, 0x87, 0x88, 0x89, 0x8A, 0x92, 0x93, 0x94,
        0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3,
        0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xB2,
        0xB3, 0xB4, 0xB5, 0xB6, 0xB7, 0xB8, 0xB9, 0xBA,
        0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9,
        0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8,
        0xD9, 0xDA, 0xE1, 0xE2, 0xE3, 0xE4, 0xE5, 0xE6,
        0xE7, 0xE8, 0xE9, 0xEA, 0xF1, 0xF2, 0xF3, 0xF4,
        0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0xFF, 0xDA,
        0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00,
        0x7B, 0x94, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0xFF, 0xD9
    ])

JPEG_DATA = make_jpeg()

import time
TS = str(int(time.time()))
BASE = "http://127.0.0.1:8000/api"
passed = 0
failed = 0
results = []

TEST_EMAIL = f"test_{TS}@example.com"
TEST_PHONE = f"9999999{TS[-5:]}"

def test(name, method, path, expected_status, auth=None, json_data=None):
    global passed, failed
    url = f"{BASE}{path}"
    headers = {"Content-Type": "application/json"}
    if auth:
        headers["Authorization"] = f"Bearer {auth}"
    try:
        if method == "GET":
            r = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            r = requests.post(url, headers=headers, json=json_data, timeout=10)
        elif method == "PUT":
            r = requests.put(url, headers=headers, json=json_data, timeout=10)
        elif method == "DELETE":
            r = requests.delete(url, headers=headers, timeout=10)
        status = "PASS" if r.status_code == expected_status else "FAIL"
        if status == "PASS":
            passed += 1
        else:
            failed += 1
        detail = ""
        try:
            body = r.json()
            if isinstance(body, dict) and "detail" in body:
                detail = f" - {body['detail']}"
        except:
            body = r.text[:100]
        results.append(f"  [{status}] {method} {path} -> {r.status_code}{detail}")
        return r
    except Exception as e:
        failed += 1
        results.append(f"  [FAIL] {method} {path} -> ERROR: {e}")
        return None

print("=" * 60)
print("Phase 1 API Test Suite")
print("=" * 60)

# Verify server is running
try:
    r = requests.get(f"{BASE}/health", timeout=5)
    if r.status_code != 200:
        print("Server not healthy, aborting")
        sys.exit(1)
    print("Server is healthy\n")
except:
    print("Server not reachable, aborting")
    sys.exit(1)

# 0. Health
test("Health Check", "GET", "/health", 200)

# 1. Register customer
print("\n--- Auth ---")
r = test("Register", "POST", "/auth/register", 200, json_data={
    "name": "Test Customer", "email": TEST_EMAIL,
    "phone": TEST_PHONE, "password": "Test@123", "confirm_password": "Test@123"
})
customer_token = None
if r and r.status_code == 200:
    customer_token = r.json()["access_token"]

# 2. Duplicate register
test("Register Duplicate", "POST", "/auth/register", 409, json_data={
    "name": "Test Customer", "email": TEST_EMAIL,
    "phone": TEST_PHONE, "password": "Test@123", "confirm_password": "Test@123"
})

# 3. Login
r = test("Login", "POST", "/auth/login", 200, json_data={
    "email": TEST_EMAIL, "password": "Test@123"
})
if r and r.status_code == 200:
    customer_token = r.json()["access_token"]

# 4. Wrong password
test("Login Wrong Password", "POST", "/auth/login", 401, json_data={
    "email": "test2@example.com", "password": "wrong"
})

# 5. Admin login
print("\n--- Admin Auth ---")
r = test("Admin Login", "POST", "/auth/login", 200, json_data={
    "email": "admin@tagon.com", "password": "admin123"
})
admin_token = None
if r and r.status_code == 200:
    admin_token = r.json()["access_token"]

# 6. Get profile
test("Get Profile", "GET", "/auth/me", 200, auth=customer_token)

# 7. Unauthorized access
test("No Auth", "GET", "/auth/me", 401)

# 8. Customer cannot access admin
test("Customer Can't Access Admin", "GET", "/admin/dashboard", 403, auth=customer_token)

# Categories (admin required)
print("\n--- Categories ---")
CAT_NAME = f"Test Category {TS}"
r = test("Create Category", "POST", "/products/categories", 200, auth=admin_token, json_data={
    "name": CAT_NAME, "description": "A test category"
})
cat_id = None
if r and r.status_code == 200:
    cat_id = r.json()["id"]

if cat_id:
    test("Get Category", "GET", f"/products/categories/{cat_id}", 200)
    updated_cat_name = f"Updated Cat {TS}"
    test("Update Category", "PUT", f"/products/categories/{cat_id}", 200, auth=admin_token, json_data={
        "name": updated_cat_name, "description": "Updated description"
    })
test("List Categories", "GET", "/products/categories", 200)

# Products
print("\n--- Products ---")
product_id = None
if cat_id:
    data = {
        "category_id": cat_id, "name": "Test Product",
        "base_price": "99.99", "product_type": "customized", "customizable": "true"
    }
    r = requests.post(f"{BASE}/products", data=data,
                      headers={"Authorization": f"Bearer {admin_token}"}, timeout=10)
    if r.status_code == 200:
        product_id = r.json()["id"]
        results.append(f"  [PASS] POST /products -> {r.status_code}")
        passed += 1
    else:
        results.append(f"  [FAIL] POST /products -> {r.status_code} - {r.text[:200]}")
        failed += 1

if product_id:
    test("Get Product", "GET", f"/products/{product_id}", 200)
    test("List Products", "GET", "/products", 200)
    test("Update Product", "PUT", f"/products/{product_id}", 200, auth=admin_token, json_data={
        "name": "Updated Product", "base_price": "49.99"
    })

# Variants
print("\n--- Variants ---")
variant_id = None
if product_id:
    r = test("Create Variant", "POST", f"/products/{product_id}/variants", 200, auth=admin_token, json_data={
        "name": "Small", "price": 49.99, "stock": 10
    })
    if r and r.status_code == 200:
        variant_id = r.json()["id"]

if variant_id:
    test("Update Variant", "PUT", f"/products/variants/{variant_id}", 200, auth=admin_token, json_data={
        "price": 39.99, "stock": 20
    })
test("List Variants", "GET", f"/products/{product_id}/variants", 200)

# Templates
print("\n--- Templates ---")
template_id = None
if product_id and admin_token:
    r = requests.post(f"{BASE}/products/{product_id}/templates",
                      data={"name": "Square Template", "max_upload_count": 3, "orientation": "square"},
                      headers={"Authorization": f"Bearer {admin_token}"}, timeout=10)
    if r.status_code == 200:
        template_id = r.json()["id"]
        results.append(f"  [PASS] POST /products/{{id}}/templates -> {r.status_code}")
        passed += 1
    else:
        results.append(f"  [FAIL] POST /products/{{id}}/templates -> {r.status_code} - {r.text[:200]}")
        failed += 1

if template_id:
    test("Update Template", "PUT", f"/products/templates/{template_id}", 200, auth=admin_token, json_data={
        "name": "Rectangle Template", "max_upload_count": 2
    })

# Orders
print("\n--- Orders ---")
order_id = None
if product_id and customer_token:
    r = test("Create Order", "POST", "/orders", 200, auth=customer_token, json_data={
        "product_id": product_id,
        "variant_id": variant_id,
        "quantity": 2,
        "delivery_address": {
            "recipient_name": "John Doe", "mobile": "8888888888",
            "address_line": "123 Test St", "city": "Mumbai",
            "state": "Maharashtra", "postal_code": "400001",
        },
        "customization_notes": "Please make it blue",
    })
    if r and r.status_code == 200:
        order_id = r.json()["id"]

if order_id:
    test("Get Order", "GET", f"/orders/{order_id}", 200, auth=customer_token)
    test("List Orders", "GET", "/orders", 200, auth=customer_token)
    test("Get Status History", "GET", f"/orders/{order_id}/status-history", 200, auth=customer_token)

# Payment
print("\n--- Payment ---")
test("Get QR Code", "GET", "/payments/qr", 200)

# Upload payment screenshot
if order_id and customer_token:
    files = {"screenshot": ("payment.jpg", io.BytesIO(JPEG_DATA), "image/jpeg")}
    data = {"transaction_id": "TXN123456"}
    r = requests.post(f"{BASE}/payments/upload/{order_id}", data=data, files=files,
                      headers={"Authorization": f"Bearer {customer_token}"}, timeout=30)
    if r.status_code == 200:
        results.append(f"  [PASS] POST /payments/upload -> {r.status_code}")
        passed += 1
    else:
        results.append(f"  [FAIL] POST /payments/upload -> {r.status_code}")
        failed += 1

# Payment verification
if order_id and admin_token:
    test("Verify Payment", "POST", f"/payments/verify/{order_id}", 200, auth=admin_token, json_data={
        "status": "verified", "remarks": "Payment confirmed"
    })

# Order status update
if order_id and admin_token:
    test("Update Order Status", "PUT", f"/orders/{order_id}/status", 200, auth=admin_token, json_data={
        "status": "designing", "remarks": "Starting design work"
    })
    test("Get Payment", "GET", f"/orders/{order_id}/payment", 200, auth=customer_token)

# Notifications
print("\n--- Notifications ---")
if customer_token:
    test("Get Notifications", "GET", "/notifications", 200, auth=customer_token)
    test("Unread Count", "GET", "/notifications/unread-count", 200, auth=customer_token)

# Admin
print("\n--- Admin ---")
if admin_token:
    test("Dashboard", "GET", "/admin/dashboard", 200, auth=admin_token)
    test("Customers", "GET", "/admin/customers", 200, auth=admin_token)
    test("Activity Logs", "GET", "/admin/activity-logs", 200, auth=admin_token)

# Upload
print("\n--- Upload ---")
if admin_token:
    files = {"file": ("test.jpg", io.BytesIO(JPEG_DATA), "image/jpeg")}
    r = requests.post(f"{BASE}/uploads/image", files=files,
                      headers={"Authorization": f"Bearer {admin_token}"}, timeout=30)
    if r.status_code == 200:
        results.append(f"  [PASS] POST /uploads/image -> {r.status_code}")
        passed += 1
    else:
        results.append(f"  [FAIL] POST /uploads/image -> {r.status_code} - {r.text[:200]}")
        failed += 1

# Delete variant (only if no order references it)
if variant_id and admin_token and not order_id:
    test("Delete Variant", "DELETE", f"/products/variants/{variant_id}", 200, auth=admin_token)

# Delete template
if template_id and admin_token:
    test("Delete Template", "DELETE", f"/products/templates/{template_id}", 200, auth=admin_token)

# Delete product
if product_id and admin_token:
    test("Delete Product", "DELETE", f"/products/{product_id}", 200, auth=admin_token)

# Delete category
if cat_id and admin_token:
    test("Delete Category", "DELETE", f"/products/categories/{cat_id}", 200, auth=admin_token)

# Logout
if customer_token:
    test("Logout", "POST", "/auth/logout", 200, auth=customer_token)

# JWT validation
print("\n--- Security ---")
test("Invalid Token", "GET", "/auth/me", 401, auth="invalid_token_here")

# No auth on admin endpoint (should be 401 because no token)
r = requests.get(f"{BASE}/admin/dashboard", timeout=10)
status = "PASS" if r.status_code in (401, 403) else "FAIL"
if status == "PASS":
    passed += 1
else:
    failed += 1
results.append(f"  [{status}] GET /admin/dashboard (no auth) -> {r.status_code}")

# Summary
print("\n" + "=" * 60)
print(f"Results: {passed} PASSED, {failed} FAILED")
print("=" * 60)
for r in results:
    print(r)
print("=" * 60)

sys.exit(0 if failed == 0 else 1)
