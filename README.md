# 🎁 TagOn - Customized Gift Ordering & Business Management System

## Overview

TagOn is a full-stack web application developed for customized gift businesses. The platform allows customers to personalize products, place orders, complete QR-based payments, communicate with the business, approve designs, and track their orders from creation to delivery.

Unlike traditional e-commerce platforms, TagOn is designed specifically for businesses that create personalized products such as mugs, photo frames, pillows, T-shirts, keychains, and other custom gifts.

The project provides both a **Customer Portal** and an **Admin Dashboard** to manage the complete business workflow.

---

# Key Features

## Customer Features

* User Registration & Login
* Browse Product Catalog
* Product Categories & Search
* Product Variant Selection
* Template Selection for Custom Products
* Image Upload for Customization
* QR Code Payment
* Payment Screenshot Upload
* Order Tracking
* Order Workspace
* Order-specific Chat with Business
* Design Approval Workflow
* In-App Notifications
* Profile Management

---

## Admin Features

* Dashboard & Analytics
* Product Management
* Category & Variant Management
* Template Management
* Order Management
* Payment Verification
* Customer Management
* Design Preview Upload
* Order Status Management
* Delivery Tracking
* Notification Management
* Image Cleanup Management

---

# Technology Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Axios
* Zustand

### Backend

* Python
* FastAPI
* SQLAlchemy
* Alembic
* JWT Authentication

### Database

* Supabase PostgreSQL

### Image Storage

* Cloudinary

### Deployment

* Vercel (Frontend)
* Render (Backend)

---

# Project Workflow

```text
Customer Login

↓

Browse Products

↓

Select Product

↓

Select Variant

↓

Select Template (For Custom Products)

↓

Upload Images

↓

Enter Customization Notes

↓

Enter Delivery Address

↓

Review Order

↓

Scan QR Code & Complete Payment

↓

Upload Payment Screenshot

↓

Submit Order

↓

Order Workspace Opens

↓

Administrator Verifies Payment

↓

Design Discussion Begins

↓

Administrator Uploads Design Preview

↓

Customer Approves or Requests Changes

↓

Printing

↓

Packing

↓

Shipping

↓

Delivered
```

---

# Repository Structure

```text
project-root/

frontend/        # React Application
backend/         # FastAPI Application
docs/            # Project Documentation
```

---

# Architecture Philosophy

The backend is designed using an API-first architecture. The React application is the first client, but it is not the only one. Future mobile applications, desktop applications, and third-party integrations will reuse the same backend services.

The backend is the single source of truth for the platform. All business rules, validation, authentication, order processing, notifications, chat, and design approval are handled by FastAPI. The frontend is responsible only for user interaction and API communication.

---

# Documentation

The project documentation is located in the **docs/** directory.

| File                   | Purpose                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `01_SRS.md`            | Functional requirements and business rules                              |
| `02_SDD.md`            | Software architecture, database design, APIs, and implementation design |
| `03_PROJECT_REPORT.md` | Development roadmap and implementation phases                           |

Developers should review these documents before starting implementation.

---

# Development Guidelines

* Follow the SRS for functional requirements.
* Follow the SDD for architecture and project structure.
* Implement features module by module.
* Keep frontend and backend loosely coupled.
* Use REST APIs for communication.
* Store only image references in the database.
* Store uploaded files in Cloudinary.
* Write clean, modular, and reusable code.
* Follow consistent naming conventions.
* Validate all user inputs.
* Maintain proper error handling.

---

# Development Order

1. Project Setup
2. Authentication
3. Product Management
4. Customer Module
5. Product Customization
6. Order Management
7. Payment Module
8. Order Workspace (Chat & Timeline)
9. Design Approval
10. Notification Module
11. Admin Dashboard
12. Reporting
13. Testing
14. Deployment

---

# Business Rules

* Customers must be registered before accessing products.
* Custom products require template selection.
* Images must be uploaded before placing an order.
* Payment is completed using TagOn's QR code.
* Orders remain pending until payment verification.
* Design work begins only after payment verification.
* Printing begins only after customer approval.
* Each order has its own dedicated Order Workspace containing chat, uploads, payment details, timeline, and design preview.
* The Order Workspace remains available throughout the order lifecycle and is archived after delivery.
* Temporary customer-uploaded images and payment screenshots are automatically removed after the configured retention period.
* Order history, messages, and business records remain stored permanently.

---

# Project Status

**Current Stage:** Planning & Documentation

The project architecture, requirements, workflows, and implementation plan have been completed. Development should proceed according to the roadmap defined in the project documentation.

---

# License

This project is intended for educational purposes, portfolio development, and deployment for the TagOn customized gift business. Modify and extend the project as needed to meet business requirements.
