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
* Order-specific Chat with Business
* Design Approval Workflow
* Email Notifications
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

### Email

* Gmail SMTP

### Deployment

* Vercel (Frontend)
* Render (Backend)

---

# Project Workflow

```text
Customer

↓

Register / Login

↓

Browse Products

↓

Select Product

↓

Choose Variant

↓

Choose Template (If Customizable)

↓

Upload Images

↓

Enter Notes

↓

QR Payment

↓

Upload Payment Screenshot

↓

Submit Order

↓

Payment Verification

↓

Design Creation

↓

Customer Approval

↓

Printing

↓

Packing

↓

Delivery
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
5. Customization Module
6. Order Management
7. Payment Module
8. Admin Dashboard
9. Chat & Design Approval
10. Notifications
11. Testing
12. Deployment

---

# Business Rules

* Customers must be registered before accessing products.
* Custom products require template selection.
* Images must be uploaded before placing an order.
* Payment is completed using TagOn's QR code.
* Orders remain pending until payment verification.
* Design work begins only after payment verification.
* Printing begins only after customer approval.
* Each customized order has its own dedicated chat workspace.
* Temporary customer images are automatically removed after the configured retention period.
* Business assets remain permanently stored.

---

# Project Status

**Current Stage:** Planning & Documentation

The project architecture, requirements, workflows, and implementation plan have been completed. Development should proceed according to the roadmap defined in the project documentation.

---

# License

This project is intended for educational purposes, portfolio development, and deployment for the TagOn customized gift business. Modify and extend the project as needed to meet business requirements.
