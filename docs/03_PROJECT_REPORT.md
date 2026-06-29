# Project Report

# TagOn - Customized Gift Ordering & Business Management System

**Version:** 1.0

## 1. Purpose

This document provides the implementation roadmap for developing the TagOn platform.

The Software Requirement Specification (SRS) defines **what** the system should do, while the Software Design Document (SDD) defines **how** the system is designed. This document explains **how the project should be developed step by step**.

Development should follow the phases in this document to ensure all modules integrate correctly.

---

# 2. Development Phases

The project should be developed in the following order.

### Phase 1

Project Setup

* Create Repository
* Configure React Project
* Configure FastAPI Project
* Configure Database
* Configure Cloudinary
* Configure SMTP
* Create Environment Files

**Output**

Project structure is ready.

---

### Phase 2

Authentication Module

Develop:

* Register
* Login
* Logout
* JWT Authentication
* Protected Routes
* User Roles

**Output**

Users can securely access the application.

---

### Phase 3

Product Management

Develop:

* Categories
* Products
* Variants
* Templates
* Product Images
* Product Details

**Output**

Administrator can manage products and customers can browse them.

---

### Phase 4

Customer Module

Develop:

* Home Page
* Product Listing
* Product Details
* Profile
* Order History

**Output**

Customers can browse products after login.

---

### Phase 5

Customization Module

Develop:

* Variant Selection
* Template Selection
* Image Upload
* Customization Notes

**Output**

Customers can prepare customized products.

---

### Phase 6

Order Module

Develop:

* Delivery Address
* Order Summary
* Order Creation
* Order Status

**Output**

Orders are created successfully.

---

### Phase 7

Payment Module

Develop:

* QR Payment Page
* Payment Screenshot Upload
* Transaction ID
* Payment Verification

**Output**

Orders wait for administrator verification.

---

### Phase 8

Admin Module

Develop:

* Dashboard
* Product Management
* Order Management
* Payment Verification
* Customer Management

**Output**

Administrator can control the business.

---

### Phase 9

Chat & Design Approval

Develop:

* Order Chat
* Image Sharing
* Design Preview
* Approval
* Revision Requests

**Output**

Customer and administrator communicate within each order.

---

### Phase 10

Production Workflow

Develop:

* Designing
* Printing
* Packing
* Shipping
* Delivery Status

**Output**

Orders move through the production process.

---

### Phase 11

Notification Module

Develop:

* In-App Notifications
* Email Notifications
* Status Updates

**Output**

Customers receive order updates automatically.

---

### Phase 12

Reporting Module

Develop:

* Dashboard Statistics
* Order Reports
* Revenue Reports
* Product Reports

**Output**

Business insights become available.

---

### Phase 13

Image Cleanup

Develop:

* Delete Customer Images
* Delete Payment Screenshots
* Delete Preview Images
* Keep Business Assets

**Output**

Storage usage remains optimized.

---

### Phase 14

Testing

Perform:

* Module Testing
* API Testing
* UI Testing
* Integration Testing
* Bug Fixes

**Output**

Application is stable.

---

### Phase 15

Deployment

Deploy:

* Frontend → Vercel
* Backend → Render
* Database → Supabase
* Images → Cloudinary

Configure:

* Environment Variables
* SMTP
* Production Settings

**Output**

Production-ready application.

---

# 3. Module Dependency

Modules should be implemented in the following dependency order.

```text
Project Setup

↓

Authentication

↓

Products

↓

Templates

↓

Customer Module

↓

Orders

↓

Payments

↓

Admin Dashboard

↓

Chat

↓

Design Approval

↓

Notifications

↓

Reports

↓

Deployment
```

Each module should be completed and tested before starting the next module.

---

# 4. Development Guidelines

The implementation should follow these guidelines:

* Follow the SRS for all functional requirements.
* Follow the SDD for architecture and project structure.
* Build reusable React components.
* Keep business logic inside backend services.
* Validate all user inputs.
* Use REST APIs for communication.
* Store images in Cloudinary.
* Store only image URLs in the database.
* Keep temporary files separate from permanent files.
* Maintain clean, modular, and readable code.

---

# 5. Completion Criteria

The project is considered complete when:

* Authentication works correctly.
* Customers can place customized and ready-made orders.
* Administrators can manage products and orders.
* Payments can be verified.
* Design approval workflow functions correctly.
* Order tracking is available.
* Notifications are working.
* Temporary images are automatically cleaned.
* The application is deployed successfully.
* All modules pass testing.

---

# 6. Final Notes

The project should prioritize modularity, maintainability, and simplicity. Every feature should be implemented as an independent module with clear responsibilities. The completed system should provide a complete digital workflow for the TagOn customized gift business, replacing manual order handling with an organized, scalable, and production-ready web application.

This document should be used only as the development roadmap. Functional behavior must always follow the **SRS**, and architectural decisions must always follow the **SDD**.
