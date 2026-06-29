# Software Design Document (SDD)

# TagOn - Customized Gift Ordering & Business Management System

**Document Version:** 1.0

**Purpose:** This document defines the software architecture, project structure, technology stack, module interactions, and implementation design for the TagOn platform. Unlike the SRS, this document explains how the system should be developed so that developers or AI coding agents can implement the application consistently.

---

# 1. System Overview

TagOn is designed as a modular full-stack web application following a client-server architecture. The system separates the presentation layer, business logic, data management, and file storage into independent components.

The architecture is designed to be scalable, maintainable, and easy to extend. Every major business feature is implemented as an independent module so that future enhancements can be added without affecting existing functionality.

The system consists of:

* React.js frontend for customer and administrator interfaces.
* FastAPI backend exposing REST APIs.
* PostgreSQL database for structured data.
* Cloudinary for image storage.
* Gmail SMTP for email notifications.

---

# 2. Technology Stack

## Frontend

* React.js
* Vite
* React Router
* Tailwind CSS
* Axios
* React Hook Form
* Zustand (State Management)

Purpose:

The frontend is responsible for rendering user interfaces, handling navigation, managing application state, validating forms, and communicating with backend APIs.

---

## Backend

* Python
* FastAPI
* SQLAlchemy ORM
* Alembic
* Pydantic
* JWT Authentication

Purpose:

The backend contains all business logic, validation, authentication, database operations, and integrations with storage and email services.

---

## Database

PostgreSQL (Supabase)

Stores:

* Users
* Products
* Categories
* Templates
* Orders
* Chats
* Payments
* Notifications

The database stores only structured data and references to uploaded files.

---

## Image Storage

Cloudinary

Stores:

* Product Images
* Template Images
* Customer Uploads
* Payment Screenshots
* Design Preview Images

The backend stores only Cloudinary URLs and public IDs in the database.

---

## Email Service

Gmail SMTP

Used for:

* Registration confirmation
* Order confirmation
* Payment verification
* Design approval notifications
* Delivery confirmation

---

# 3. High-Level Architecture

The application follows a layered architecture.

```text
Customer/Admin
        │
        ▼
React Frontend
        │
REST API (HTTPS)
        │
        ▼
FastAPI Backend
        │
 ┌──────┼───────────────┐
 │      │               │
 ▼      ▼               ▼
Database Cloudinary    SMTP
```

Responsibilities:

* React handles UI and user interactions.
* FastAPI processes business logic.
* PostgreSQL stores application data.
* Cloudinary stores files.
* SMTP delivers emails.

Each layer has a single responsibility, reducing coupling and improving maintainability.

---

# 4. Project Structure

The project is divided into three independent repositories or folders:

```text
project-root/

frontend/
backend/
docs/
```

### frontend/

Contains the React application.

Responsible for:

* User Interface
* Navigation
* Forms
* API Communication
* State Management

---

### backend/

Contains the FastAPI application.

Responsible for:

* Authentication
* Business Logic
* Database Operations
* File Uploads
* Email Service
* API Endpoints

---

### docs/

Contains project documentation.

Files:

* SRS.md
* SDD.md
* PROJECT_REPORT.md

These documents serve as the development reference.

---

# 5. Frontend Architecture

The frontend follows a component-based architecture.

Recommended folder structure:

```text
src/

assets/
components/
layouts/
pages/
hooks/
services/
store/
utils/
routes/
types/
```

### Components

Reusable UI elements.

Examples:

* Navbar
* Sidebar
* Product Card
* Template Card
* Upload Component
* Chat Window
* Timeline
* Buttons
* Dialogs
* Notification Toast

---

### Pages

Each major feature has its own page.

Examples:

* Login
* Register
* Home
* Product Details
* Checkout
* Customer Dashboard
* Order Details
* Admin Dashboard
* Product Management
* Order Management

Pages should remain lightweight and delegate logic to services and reusable components.

---

### Services

Responsible for API communication.

Examples:

* Auth Service
* Product Service
* Order Service
* Payment Service
* Chat Service
* Notification Service

Business logic should not be placed inside UI components.

---

### Store

Global application state.

Stores:

* Logged-in user
* Authentication token
* Theme
* Notifications
* Cart (ready-made products only)

---

# 6. Backend Architecture

The backend follows a layered service architecture.

Recommended structure:

```text
backend/

api/
models/
schemas/
services/
repositories/
core/
utils/
```

### API Layer

Receives HTTP requests.

Responsibilities:

* Request validation
* Authentication
* Calling services
* Returning responses

No business logic should exist in API routes.

---

### Service Layer

Contains all business logic.

Examples:

* Register User
* Create Order
* Verify Payment
* Upload Design
* Send Email

All application rules are implemented here.

---

### Repository Layer

Handles communication with the database.

Responsibilities:

* CRUD operations
* Database queries
* Data filtering

This separates database logic from business logic.

---

### Model Layer

Defines database entities.

Examples:

* User
* Product
* Template
* Order
* Payment
* Chat
* Notification

---

### Schema Layer

Defines request and response models using Pydantic.

Responsibilities:

* Input validation
* Response formatting
* API documentation

---

### Core

Contains application-wide configuration.

Examples:

* JWT configuration
* Database connection
* Environment settings
* Cloudinary configuration
* SMTP configuration

---

# 7. Module Interaction

The system is divided into independent business modules.

Main modules:

* Authentication
* Products
* Templates
* Orders
* Payments
* Chat
* Notifications
* Administration

Modules communicate only through services and APIs.

Direct dependencies between unrelated modules should be avoided.

---

# 8. Design Principles

The following principles should be followed throughout development:

* Modular architecture.
* Separation of concerns.
* Reusable components.
* Service-oriented backend.
* RESTful API design.
* Consistent naming conventions.
* Minimal code duplication.
* Clear validation rules.
* Environment-based configuration.
* Easy future scalability.

These principles ensure that the codebase remains clean, maintainable, and suitable for long-term development.

---

# 9. Development Standards

The project shall follow these standards:

* Consistent folder structure.
* One responsibility per module.
* Descriptive file and function names.
* Reusable components whenever possible.
* No hardcoded secrets.
* Centralized configuration.
* Proper error handling.
* Consistent API response format.
* Clear documentation for complex logic.

These standards help both developers and AI coding agents produce consistent, maintainable code.

# 10. Database Design

## Overview

The database stores only structured application data. All uploaded images and files are stored in Cloudinary, while the database stores only their URLs and public IDs.

The database shall maintain relationships between users, products, templates, orders, payments, chats, and notifications.

---

## Main Tables

### Users

Stores customer and administrator information.

Fields:

* User ID
* Name
* Email
* Phone
* Password
* Role
* Status
* Created At

---

### Categories

Stores product categories.

Fields:

* Category ID
* Category Name
* Description
* Status

---

### Products

Stores all available products.

Fields:

* Product ID
* Category ID
* Product Name
* Description
* Base Price
* Product Type
* Customizable
* Status

---

### Product Variants

Stores different versions of a product.

Example:

* Normal Mug
* Magic Mug
* Unbreakable Mug

Fields:

* Variant ID
* Product ID
* Variant Name
* Price
* Stock

---

### Templates

Stores printable templates.

Fields:

* Template ID
* Product ID
* Template Name
* Preview Image
* Maximum Upload Count
* Status

---

### Orders

Stores every customer order.

Fields:

* Order ID
* Customer ID
* Product ID
* Variant ID
* Template ID
* Quantity
* Total Amount
* Payment Status
* Order Status
* Delivery Address
* Created At

---

### Payments

Stores payment information.

Fields:

* Payment ID
* Order ID
* Screenshot URL
* Transaction ID
* Verification Status
* Verified By
* Verified At

---

### Chats

Stores order-specific conversations.

Fields:

* Chat ID
* Order ID
* Sender
* Message
* Attachment URL
* Created At

---

### Notifications

Stores notifications.

Fields:

* Notification ID
* User ID
* Title
* Message
* Status
* Created At

---

## Relationships

```text
User
 │
 ├── Orders
 │      │
 │      ├── Product
 │      ├── Variant
 │      ├── Template
 │      ├── Payment
 │      └── Chat
 │
 └── Notifications
```

---

# 11. API Design

The backend exposes REST APIs.

Each module has its own API group.

---

## Authentication APIs

* Register
* Login
* Logout
* Forgot Password
* Reset Password

---

## Product APIs

* Get Categories
* Get Products
* Get Product Details
* Create Product
* Update Product
* Delete Product

---

## Template APIs

* Get Templates
* Create Template
* Update Template
* Delete Template

---

## Order APIs

* Create Order
* Get Orders
* Get Order Details
* Update Order Status
* Cancel Order

---

## Payment APIs

* Upload Payment Screenshot
* Verify Payment
* Payment Status

---

## Chat APIs

* Send Message
* Upload Attachment
* Get Chat History

---

## Notification APIs

* Get Notifications
* Mark as Read

---

## Admin APIs

* Dashboard Statistics
* Customer Management
* Reports
* System Settings

---

# 12. Application Workflow

The application follows a predefined workflow.

## Customer Flow

```text
Register

↓

Login

↓

Browse Products

↓

Select Product

↓

Select Variant

↓

Select Template

↓

Upload Images

↓

Enter Notes

↓

Payment

↓

Upload Screenshot

↓

Submit Order
```

---

## Admin Flow

```text
Receive Order

↓

Verify Payment

↓

Design Product

↓

Upload Preview

↓

Customer Approval

↓

Printing

↓

Packing

↓

Shipping

↓

Delivery
```

---

## Design Approval Flow

```text
Upload Preview

↓

Customer Review

↓

Approved?

↓

Yes → Printing

No → Modify Design

↓

Upload Again
```

---

# 13. Security Design

The application shall implement security at every layer.

## Authentication

* JWT Authentication
* Password Hashing
* Protected APIs

---

## Authorization

Role-Based Access Control.

Roles:

* Customer
* Administrator

---

## File Upload

* File Type Validation
* File Size Validation
* Image Only Uploads
* Virus-safe upload handling

---

## API Protection

* Input Validation
* SQL Injection Prevention
* XSS Protection
* Secure Error Responses

---

# 14. Image Storage Design

Images are divided into two categories.

## Permanent

* Product Images
* Template Images
* Business Logo

These remain available permanently.

---

## Temporary

* Customer Uploads
* Payment Screenshots
* Design Preview Images

These are deleted after the configured retention period following successful delivery.

---

## Storage Flow

```text
Upload Image

↓

Cloudinary

↓

Store URL

↓

Save URL in Database

↓

Use During Order

↓

Delete Temporary Files

↓

Keep Database Records
```

---

# 15. Error Handling Strategy

The application shall provide meaningful error handling.

Examples:

* Invalid Login
* Missing Fields
* Upload Failure
* Payment Verification Failure
* Invalid Order
* Server Error

Every API shall return a standard response format containing:

* Status
* Message
* Data (if available)

Sensitive system information shall never be exposed.

---

# 16. Deployment Architecture

## Frontend

React application deployed on Vercel.

---

## Backend

FastAPI application deployed on Render.

---

## Database

Supabase PostgreSQL.

---

## Storage

Cloudinary.

---

## Email

Gmail SMTP.

---

## Deployment Flow

```text
GitHub Repository

        │

Frontend → Vercel

Backend → Render

Database → Supabase

Storage → Cloudinary

Email → Gmail SMTP
```

All secrets shall be managed using environment variables.

---

# 17. Coding Standards

The project shall follow consistent development standards.

### Frontend

* Reusable components.
* Page-based routing.
* Service-based API calls.
* Clean state management.

### Backend

* Layered architecture.
* Service and repository separation.
* RESTful APIs.
* Centralized configuration.

### General

* Meaningful naming.
* Modular structure.
* Proper documentation.
* Reusable utilities.
* Consistent error handling.

---

# 18. Future Extensibility

The architecture is designed to support future enhancements without major restructuring.

Possible future additions include:

* Online payment gateway.
* WhatsApp notifications.
* Mobile application.
* AI-assisted image validation.
* Inventory management.
* Coupon system.
* Customer reviews.
* Delivery partner integration.
* Multi-business support.

The modular design allows new features to be added independently while preserving the existing codebase.

---

# SDD Conclusion

The Software Design Document defines the technical architecture and implementation strategy for the TagOn Customized Gift Ordering & Business Management System. It describes the project structure, module organization, database design, REST APIs, workflows, security model, storage strategy, deployment architecture, and development standards.

This document serves as the primary technical reference for developers and AI coding agents, ensuring that every module is implemented consistently, follows a clean architecture, and remains scalable, maintainable, and production-ready.
