# Software Requirement Specification (SRS)

# TagOn - Customized Gift Ordering & Business Management System

**Document Version:** 1.0

**Project Name:** TagOn

**Project Type:** Full Stack Web Application

**Frontend:** React.js

**Backend:** FastAPI (Python)

**Database:** PostgreSQL (Supabase)

**Image Storage:** Cloudinary

**Email Service:** Gmail SMTP

---

# 1. Project Introduction

## 1.1 Overview

TagOn is a full-stack web application designed specifically for businesses that provide customized gifts. Unlike traditional e-commerce websites where customers purchase ready-made products, TagOn focuses on personalized products that require customer interaction, image uploads, template selection, design approval, and manual production before delivery.

The primary objective of the platform is to digitize the complete business workflow of a customized gift provider. The system enables customers to browse products, select customization templates, upload personal images, complete payments through a QR code, communicate with the business regarding design changes, approve the final design, and track the order until delivery.

For the business owner, the platform provides a centralized administration dashboard to manage products, product templates, customer orders, payment verification, design approvals, production status, and delivery updates.

The application replaces manual order handling through phone calls and messaging applications with an integrated, structured, and trackable workflow.

This document defines all functional and non-functional requirements of the TagOn platform. It serves as the primary source of requirements for software development and must be followed throughout the implementation lifecycle.

---

## 1.2 Purpose

The purpose of this project is to develop a centralized web-based solution that simplifies the complete ordering and production process for customized gift businesses.

The system aims to:

* Eliminate manual order management.
* Provide an organized ordering experience for customers.
* Simplify communication between customers and the business.
* Maintain all order information within a single platform.
* Reduce human errors during customization.
* Provide proper order tracking.
* Improve business efficiency.
* Create a scalable platform that can support future business growth.

The system is intended for both production use and as a professional portfolio-quality software project demonstrating modern full-stack application architecture.

---

## 1.3 Project Scope

The application supports two categories of products:

### Category 1 — Customized Products

Products that require customer personalization.

Examples include:

* Ceramic Mugs
* Magic Mugs
* Unbreakable Mugs
* Pillows
* T-Shirts
* Photo Frames
* Acrylic Frames
* Keychains
* Photo Slates
* Customized Gift Items

These products require:

* Variant selection
* Template selection
* Image upload
* Customer notes
* Payment verification
* Design creation
* Customer approval
* Printing
* Delivery

---

### Category 2 — Ready-Made Products

Products that do not require customization.

Examples include:

* Quote Mugs
* Printed Frames
* Decorative Items
* Pre-designed Gifts
* Festival Gifts

These products require only:

* Product selection
* Quantity selection
* Payment
* Delivery

No image upload or design approval is required.

---

## 1.4 Project Goals

The system should achieve the following goals:

* Provide an intuitive customer experience.
* Minimize manual communication.
* Replace WhatsApp-based order management.
* Maintain complete order history.
* Improve production workflow.
* Reduce order confusion.
* Support secure customer authentication.
* Store product information efficiently.
* Store uploaded customer images temporarily.
* Support design approval before printing.
* Maintain complete delivery tracking.
* Provide a scalable architecture suitable for future upgrades.

---

# 2. Project Vision

The vision of TagOn is to become a complete digital business management platform for customized gift providers.

Rather than functioning as a basic online shopping website, TagOn is designed to act as an end-to-end order processing system where every customized order follows a structured workflow from product selection to final delivery.

The platform should provide a seamless experience for both customers and administrators by combining e-commerce capabilities with order management, customization workflows, design approval, communication, and production tracking.

The long-term vision includes:

* Providing a modern online presence for small businesses.
* Eliminating dependency on manual order handling.
* Creating a professional ordering experience.
* Reducing operational workload.
* Increasing customer satisfaction.
* Supporting future integration with payment gateways.
* Supporting future AI-powered image validation.
* Supporting future WhatsApp integration.
* Supporting future mobile applications.
* Supporting multiple business branches if required.

The system architecture should be modular so that additional features can be added without redesigning the existing application.

---

# 3. Business Model

TagOn follows a **Business-to-Customer (B2C)** customized ordering model.

Unlike traditional e-commerce platforms, customized products cannot be manufactured until the customer provides personalization details and completes payment.

The business workflow is intentionally designed so that the business only starts designing after payment verification.

This prevents resource wastage caused by fake customization requests.

The business model consists of the following stages:

### Stage 1 — Product Discovery

Customers register and log into the platform.

After authentication, customers can browse all available products.

Products are divided into:

* Customized Products
* Ready-Made Products

Each product displays:

* Images
* Description
* Price
* Available variants
* Available templates (if customizable)

---

### Stage 2 — Product Customization

If the selected product is customizable, the customer must:

* Select product variant.
* Select design template.
* Upload required images.
* Enter customization notes.
* Enter delivery information.

Every template defines:

* Template ID
* Preview image
* Maximum number of images
* Design layout
* Image orientation

---

### Stage 3 — Payment

The system does not use an online payment gateway.

Instead:

* The website displays TagOn's QR code.
* Customer completes payment using any UPI application.
* Customer uploads payment screenshot.
* Customer optionally enters transaction ID.
* Order enters "Payment Verification" state.

The business manually verifies payment.

Only after payment verification can production begin.

---

### Stage 4 — Design Process

After payment verification:

* Order becomes active.
* Chat workspace is unlocked.
* TagOn designer creates artwork.
* Design preview is uploaded.
* Customer reviews design.
* Customer requests changes if required.
* Final approval is collected.

No printing starts before approval.

---

### Stage 5 — Production

After customer approval:

* Printing begins.
* Product quality is checked.
* Product is packed.
* Delivery status is updated.

---

### Stage 6 — Delivery

Customer can track the order using the dashboard.

Order progresses through statuses:

* Payment Verified
* Designing
* Approval Pending
* Approved
* Printing
* Packing
* Shipped
* Delivered

---

### Stage 7 — Cleanup

After successful delivery and a configurable retention period:

The system automatically deletes temporary customer assets:

* Uploaded customer images
* Design preview images
* Payment screenshots

The following records remain permanently:

* Customer account
* Product information
* Order history
* Chat messages (text only)
* Invoice
* Order status timeline

This minimizes storage usage while preserving business records.

---

# 4. User Roles

The system supports role-based access control.

Each role has specific permissions.

No user should access resources outside their assigned permissions.

---

## 4.1 Customer

Customers are registered users purchasing products.

Customers can:

* Register
* Login
* Manage profile
* Browse products
* View categories
* Search products
* Select variants
* Select templates
* Upload images
* Enter customization notes
* Place orders
* Upload payment screenshots
* View order history
* Chat with TagOn after payment verification
* Approve or reject design previews
* Track order status
* View invoices
* Update profile information

Customers cannot:

* Access admin pages
* Modify products
* View other customer orders
* Verify payments
* Change production status

---

## 4.2 Administrator (TagOn)

Administrator is the business owner or authorized employee.

Administrator has complete control over the platform.

Administrator responsibilities include:

* Product management
* Category management
* Variant management
* Template management
* Customer management
* Payment verification
* Order confirmation
* Design uploads
* Customer communication
* Order status updates
* Production management
* Delivery management
* Notification management
* Report generation
* SMTP configuration
* Business profile management

Administrator can access all business data.

---

# 5. Business Workflow

The following workflow defines the complete lifecycle of every customized order.

This workflow is mandatory and should be implemented exactly as specified.

---

## Customer Workflow

1. Customer registers an account.
2. Customer logs into the system.
3. Customer browses products.
4. Customer selects a customized product.
5. Customer selects product variant.
6. Customer selects design template.
7. Customer uploads required images.
8. Customer enters customization notes.
9. Customer enters delivery address.
10. Customer reviews order summary.
11. Customer scans TagOn QR code.
12. Customer completes UPI payment.
13. Customer uploads payment screenshot.
14. Customer submits the order.
15. Order status becomes **Payment Verification**.

---

## Administrator Workflow

1. Administrator receives new order notification.
2. Administrator verifies payment.
3. If payment is invalid, the administrator rejects the payment and requests correction.
4. If payment is valid, the administrator approves the payment.
5. Order status changes to **Designing**.
6. Order chat becomes available.
7. Designer prepares the customized artwork.
8. Designer uploads design preview.
9. Customer receives notification.

---

## Design Approval Workflow

1. Customer reviews the design preview.
2. Customer approves the design or requests modifications.
3. If modifications are requested, the administrator uploads a revised design.
4. The review cycle repeats until approval is received.
5. After approval, order status changes to **Approved for Printing**.

---

## Production Workflow

1. Printing begins.
2. Product quality inspection is completed.
3. Product is packed.
4. Shipment is prepared.
5. Delivery status is updated.

---

## Delivery Workflow

1. Order is shipped.
2. Customer tracks delivery.
3. Product is delivered.
4. Order is marked as completed.
5. Temporary uploaded files are automatically removed after the retention period.
6. Permanent business records remain available for future reference.

---

## Workflow Principles

The following business rules are mandatory:

* Customers cannot access the design chat before payment verification.
* Design work must never begin before payment verification.
* Printing must never begin before customer approval.
* Every customized order must be associated with a selected template.
* Every uploaded image must belong to a specific order.
* Every order must maintain a complete status timeline.
* Temporary files must be automatically cleaned after the configured retention period.
* Permanent business records must never be deleted automatically.
* All order communication must remain linked to the corresponding order to maintain a complete project history.

This workflow ensures that TagOn operates as a structured customized gift management platform rather than a conventional online shopping website.

# 6. Complete Functional Requirements

## 6.1 Overview

This section defines all functional requirements of the TagOn Customized Gift Ordering and Business Management System. Functional requirements describe every feature that the software must provide for both customers and administrators.

The system shall provide a secure, scalable, and user-friendly environment where customers can browse customized gift products, personalize products using predefined templates, upload images, complete payments, communicate with the business regarding design modifications, approve final designs, and track their orders until successful delivery.

The administrator shall have complete control over product management, order management, payment verification, customer communication, design approval, production workflow, delivery tracking, and system configuration.

Every functional requirement defined in this document is considered mandatory unless explicitly marked as optional.

---

# 6.2 User Registration

### Description

The system shall allow new customers to create an account before accessing the platform.

### Inputs

* Full Name
* Email Address
* Mobile Number
* Password
* Confirm Password

### Validation Rules

* Email must be unique.
* Mobile number must be unique.
* Password must satisfy minimum security requirements.
* Password confirmation must match.
* Empty fields are not allowed.

### Expected Output

A customer account is created and the user can log in.

---

# 6.3 User Authentication

The system shall provide secure authentication.

Supported features:

* Login
* Logout
* Forgot Password
* Password Reset
* Session Management
* JWT Authentication

Only authenticated users can place orders.

---

# 6.4 User Profile Management

The customer shall be able to:

* View profile
* Edit profile
* Change password
* Update mobile number
* Update delivery address
* View order history

---

# 6.5 Product Browsing

The system shall display all available products after successful login.

Products shall be organized into categories.

Each product must display:

* Product Image
* Product Name
* Category
* Price
* Availability
* Product Type
* Short Description

---

# 6.6 Product Search

The system shall support searching products using:

* Product Name
* Category
* Keywords

The search results shall update dynamically.

---

# 6.7 Product Categories

The system shall organize products into categories.

Example categories include:

* Ceramic Mugs
* Magic Mugs
* Unbreakable Mugs
* Pillows
* Photo Frames
* Acrylic Frames
* T-Shirts
* Keychains
* Wall Decor
* Gift Boxes

Each product belongs to one category.

---

# 6.8 Product Details

The product details page shall display:

* Product Images
* Product Description
* Price
* Product Specifications
* Available Variants
* Product Type
* Customization Availability
* Estimated Delivery Time

If the product is customizable, template selection shall be enabled.

---

# 6.9 Product Variants

Products may contain multiple variants.

Example:

Ceramic Mug

* Normal Mug
* Magic Mug
* Unbreakable Mug

Each variant shall have:

* Variant Name
* Price
* Stock Status
* Variant Image

---

# 6.10 Product Template Selection

Customized products shall require template selection.

Each template shall contain:

* Template ID
* Template Preview Image
* Maximum Number of Images
* Orientation
* Design Layout
* Product Compatibility

Customers cannot continue without selecting a template.

---

# 6.11 Image Upload

Customers shall upload images required for customization.

The system shall validate:

* Maximum Image Count
* Allowed File Types
* Maximum File Size
* Corrupted Files
* Empty Uploads

Uploaded images shall be linked to the order.

---

# 6.12 Customization Notes

Customers may provide:

* Gift Message
* Printing Instructions
* Special Requests

These notes shall be visible to the administrator.

---

# 6.13 Order Placement

Customers shall place an order after:

* Selecting Product
* Selecting Variant
* Selecting Template
* Uploading Images
* Entering Delivery Address

The system shall generate a unique Order ID.

---

# 6.14 QR Payment

The system shall display TagOn's QR code.

Customers shall:

* Scan QR
* Complete Payment
* Upload Payment Screenshot
* Optionally provide Transaction ID

No online payment gateway shall be integrated.

---

# 6.15 Payment Verification

Payment verification shall be performed manually by the administrator.

Possible payment states:

* Pending
* Verified
* Rejected

No production work shall begin before payment verification.

---

# 6.16 Customer Dashboard

Customers shall have access to a personalized dashboard.

The dashboard shall display:

* Active Orders
* Completed Orders
* Pending Payments
* Notifications
* Chat Access
* Profile Information

---

# 6.17 Order Tracking

Customers shall track order progress.

Supported statuses:

* Payment Verification
* Designing
* Design Approval
* Printing
* Packing
* Shipped
* Delivered
* Cancelled

Each status change shall be timestamped.

---

# 6.18 Customer–Admin Chat

Each paid customized order shall have a dedicated chat workspace.

The chat shall support:

* Text Messages
* Image Upload
* Design Preview Sharing
* Revision Requests
* Approval Messages

The chat shall only become available after payment verification.

---

# 6.19 Design Approval

The administrator shall upload one or more design previews.

The customer shall:

* Approve Design
* Request Modifications

The revision cycle continues until customer approval is received.

Printing shall not begin until approval is granted.

---

# 6.20 Notification System

The system shall notify customers when:

* Order Submitted
* Payment Verified
* Design Uploaded
* Revision Requested
* Design Approved
* Printing Started
* Packed
* Shipped
* Delivered

Administrators shall receive notifications for:

* New Orders
* New Payments
* New Customer Messages
* Design Approval Responses

---

# 6.21 Product Management

Administrators shall manage:

* Products
* Categories
* Variants
* Product Images
* Pricing
* Stock
* Product Status

CRUD (Create, Read, Update, Delete) operations shall be supported.

---

# 6.22 Template Management

Administrators shall:

* Create Templates
* Update Templates
* Delete Templates
* Assign Templates to Products
* Upload Preview Images
* Define Maximum Upload Count

---

# 6.23 Order Management

Administrators shall:

* View Orders
* Filter Orders
* Search Orders
* Update Status
* Verify Payments
* Cancel Orders
* View Customer Uploads
* Manage Delivery

---

# 6.24 Customer Management

Administrators shall:

* View Customers
* Search Customers
* View Order History
* Block Users (if required)
* Reset Customer Access (if required)

---

# 6.25 Report Generation

The system shall generate reports for:

* Daily Orders
* Monthly Orders
* Revenue
* Product Sales
* Pending Orders
* Delivered Orders
* Cancelled Orders

---

# 6.26 Email System

The system shall automatically send emails for:

* Registration
* Order Confirmation
* Payment Verification
* Design Upload
* Order Completion
* Delivery Confirmation

Emails shall be sent using Gmail SMTP.

---

# 6.27 Image Management

The system shall permanently store:

* Product Images
* Template Images
* Business Logo

The system shall temporarily store:

* Customer Uploaded Images
* Design Preview Images
* Payment Screenshots

Temporary files shall be removed after successful delivery and the configured retention period.

---

# 6.28 Audit & Activity Logging

The system shall maintain logs for important business events including:

* User Registration
* User Login
* Product Creation
* Product Updates
* Order Creation
* Payment Verification
* Status Changes
* Design Approval
* Delivery Completion

These logs assist in administration, troubleshooting, and future auditing.

---

# 6.29 Functional Requirement Summary

The TagOn system shall provide a complete end-to-end customized gift ordering workflow consisting of secure user authentication, product browsing, customization, image upload, QR-based payment, manual payment verification, order-specific communication, design approval, production management, delivery tracking, reporting, and administrative control. Every functional module described in this section shall be implemented and integrated to provide a seamless customer experience and an efficient business management platform.

# 7. Non-Functional Requirements

## 7.1 Overview

This section defines the non-functional requirements of the TagOn Customized Gift Ordering & Business Management System. While the functional requirements describe what the application must do, the non-functional requirements define the quality standards, performance expectations, security policies, usability guidelines, scalability considerations, maintainability goals, and deployment constraints.

These requirements ensure that the application is reliable, secure, responsive, maintainable, and capable of supporting future enhancements without requiring significant architectural changes.

All implementation decisions should satisfy the requirements defined in this section.

---

# 7.2 Performance Requirements

The system shall provide a responsive user experience across all supported devices.

### Performance Goals

* Initial page loading time should be less than 3 seconds under normal network conditions.
* API responses should generally complete within 500 milliseconds for standard operations.
* Product listing pages should support pagination or lazy loading.
* Image uploads shall display upload progress indicators.
* Large product catalogs should not significantly affect browsing performance.
* Dashboard pages shall load efficiently using optimized API requests.

### Optimization Requirements

* Images shall be compressed before storage whenever possible.
* Lazy loading shall be used for product images.
* API requests shall avoid unnecessary data transfer.
* Database queries shall be optimized using indexes.
* Frequently accessed data should be cached where appropriate.

---

# 7.3 Scalability Requirements

The system shall be designed using a modular architecture to support future growth.

The architecture shall support:

* Additional product categories.
* New product variants.
* Multiple administrators.
* Additional customization templates.
* Increased customer accounts.
* Large order history.
* Future payment gateway integration.
* Future mobile application support.
* Future multi-branch business support.

The architecture should avoid tightly coupled modules.

---

# 7.4 Security Requirements

Security is a mandatory requirement for all application modules.

### Authentication

* Passwords shall never be stored in plain text.
* Passwords shall be securely hashed before storage.
* Authentication shall use JWT tokens.
* Protected APIs shall require valid authentication tokens.
* Unauthorized users shall not access protected resources.

### Authorization

Role-based access control shall be implemented.

Customer permissions and administrator permissions shall remain completely isolated.

### File Upload Security

The system shall:

* Validate file type.
* Validate maximum file size.
* Reject executable files.
* Reject unsupported file formats.
* Reject corrupted files.

### API Security

* All input shall be validated.
* SQL Injection shall be prevented.
* Cross-Site Scripting (XSS) shall be prevented.
* Sensitive information shall never be exposed through API responses.

---

# 7.5 Reliability Requirements

The application shall remain stable during normal business operations.

Requirements include:

* Prevent duplicate order creation.
* Prevent duplicate payment verification.
* Preserve customer order history.
* Maintain data consistency.
* Handle unexpected failures gracefully.
* Prevent accidental data loss.

The system shall provide meaningful error messages instead of application crashes.

---

# 7.6 Availability Requirements

The application shall be available whenever the hosting platform is operational.

The system should support:

* Continuous customer access.
* Continuous administrator access.
* Reliable database connectivity.
* Reliable image storage.
* Reliable email delivery.

The application should recover automatically after temporary hosting interruptions.

---

# 7.7 Maintainability Requirements

The project shall follow a clean and modular software architecture.

Requirements include:

* Modular code organization.
* Reusable UI components.
* Service-based backend architecture.
* Consistent folder structure.
* Clear naming conventions.
* Comprehensive documentation.
* Easy feature extension.

The codebase should be understandable by new developers with minimal onboarding.

---

# 7.8 Usability Requirements

The application shall provide an intuitive and user-friendly interface.

Requirements include:

* Simple navigation.
* Consistent layouts.
* Clear action buttons.
* Easy customization workflow.
* Minimal learning curve.
* Responsive forms.
* Informative validation messages.

Users should be able to complete the ordering process without external assistance.

---

# 7.9 Accessibility Requirements

The application should follow accessibility best practices.

Requirements include:

* Readable typography.
* High color contrast.
* Keyboard navigation support.
* Accessible form labels.
* Proper button descriptions.
* Screen reader compatibility where possible.

---

# 7.10 Compatibility Requirements

The application shall function correctly on modern web browsers.

Supported browsers include:

* Google Chrome
* Microsoft Edge
* Mozilla Firefox
* Safari

The application shall also function correctly on desktop, tablet, and mobile devices.

---

# 7.11 Responsive Design Requirements

The user interface shall automatically adapt to different screen sizes.

Supported layouts include:

* Mobile phones
* Tablets
* Laptops
* Desktop monitors

Responsive behavior shall include:

* Flexible grids.
* Adaptive navigation.
* Responsive product cards.
* Mobile-friendly forms.
* Optimized image display.

---

# 7.12 Data Storage Requirements

Application data shall be divided into structured data and media files.

### Structured Data

Stored in PostgreSQL.

Includes:

* Users
* Products
* Orders
* Payments
* Chats
* Notifications
* Reports

### Media Storage

Stored separately.

Includes:

* Product Images
* Template Images
* Customer Images
* Design Preview Images
* Payment Screenshots

Database records shall store only image references rather than binary image data.

---

# 7.13 Image Retention Policy

Permanent storage shall include:

* Product Images
* Template Images
* Business Logo

Temporary storage shall include:

* Customer Uploaded Images
* Design Preview Images
* Payment Screenshots

Temporary files shall be automatically deleted after successful delivery and the configured retention period.

Business records shall remain permanently available.

---

# 7.14 Backup Requirements

The system shall ensure that important business information can be recovered.

The following data shall be preserved:

* Customer Accounts
* Products
* Orders
* Payment Records
* Chat Messages
* Delivery Records

Backups should not include temporary customer images after they have been deleted.

---

# 7.15 Error Handling Requirements

The application shall gracefully handle all expected errors.

Examples include:

* Invalid login credentials.
* Network failures.
* Payment verification failure.
* File upload errors.
* Missing required information.
* Database connection issues.

Users shall receive meaningful error messages instead of technical exceptions.

---

# 7.16 Logging Requirements

The system shall maintain operational logs.

Logged events include:

* User Login
* Registration
* Product Updates
* Order Creation
* Payment Verification
* Design Approval
* Delivery Completion
* Administrator Actions

Logs shall support future debugging and auditing.

---

# 7.17 Deployment Requirements

The production deployment shall use:

### Frontend

React.js deployed on Vercel.

### Backend

FastAPI deployed on Render.

### Database

PostgreSQL provided by Supabase.

### Image Storage

Cloudinary.

### Email Service

Gmail SMTP.

Environment variables shall be used for all sensitive configuration values.

---

# 7.18 Code Quality Requirements

The software shall follow modern development standards.

Requirements include:

* Consistent coding style.
* Modular architecture.
* Reusable components.
* API separation.
* Type validation.
* Proper exception handling.
* Documentation comments where necessary.

The project should remain maintainable as it grows.

---

# 7.19 Future Extensibility

The architecture shall support future enhancements without major redesign.

Potential future features include:

* Online payment gateway integration.
* WhatsApp notifications.
* Mobile application.
* AI-assisted image validation.
* Coupon management.
* Customer reviews.
* Inventory management.
* Delivery partner integration.
* Multi-business support.
* Multi-language support.

The system shall remain modular so that new modules can be integrated independently.

---

# 7.20 Non-Functional Requirement Summary

The TagOn system shall provide a secure, scalable, maintainable, responsive, and production-ready platform capable of supporting customized gift ordering and business management. The application shall emphasize performance, security, modularity, usability, and future extensibility while maintaining a clean architecture suitable for long-term development and deployment.

# 8. Customer Module

## 8.1 Module Overview

The Customer Module is the primary interface through which customers interact with the TagOn platform. It provides all functionality required to browse products, customize gifts, upload images, place orders, make payments, communicate with the business, approve designs, and track deliveries.

The module shall provide a simple, guided workflow that minimizes user confusion while ensuring all information required by the business is collected before production begins.

The customer module shall only be accessible after successful user authentication.

---

# 8.2 Customer Registration

## Purpose

Allow new users to create a customer account.

## Features

* Register using name, email, phone number and password.
* Validate all user inputs.
* Prevent duplicate email addresses.
* Prevent duplicate phone numbers.
* Encrypt passwords before storing them.
* Automatically redirect users to the login page after successful registration.

## Inputs

* Full Name
* Email Address
* Mobile Number
* Password
* Confirm Password

## Validation

* All fields are mandatory.
* Email format must be valid.
* Phone number must be unique.
* Password must meet security requirements.
* Confirm password must match.

---

# 8.3 Customer Login

## Purpose

Authenticate customers and provide access to protected pages.

## Features

* Email login.
* Password verification.
* Remember session.
* Logout.
* Forgot password.
* Password reset.

After successful login the customer shall be redirected to the Home page.

---

# 8.4 Home Dashboard

The customer home page acts as the entry point after login.

It shall display:

* Featured Products
* Trending Products
* Newly Added Products
* Categories
* Special Offers
* Search Bar
* User Profile Shortcut
* My Orders Shortcut

The page shall load product data dynamically.

---

# 8.5 Product Browsing

Customers shall be able to browse all available products.

Products shall be displayed using responsive product cards.

Each card shall contain:

* Product Image
* Product Name
* Starting Price
* Product Category
* Customizable Badge
* Rating (future feature)
* View Details Button

Products shall support:

* Pagination
* Filtering
* Sorting
* Search

---

# 8.6 Product Details

Selecting a product shall open the Product Details page.

The page shall display:

* Product Images
* Description
* Available Variants
* Price
* Estimated Delivery Time
* Product Specifications
* Product Type
* Customizable Status

If the product is customizable, additional customization options shall be displayed.

---

# 8.7 Product Variant Selection

Some products contain multiple variants.

Example:

Ceramic Mug

* Normal Mug
* Magic Mug
* Unbreakable Mug

Customers must select exactly one variant before continuing.

Each variant may have:

* Different price
* Different stock
* Different preview image

---

# 8.8 Template Selection

Customized products require a design template.

The customer shall select one template before proceeding.

Each template shall display:

* Template Preview
* Template Number
* Maximum Images Allowed
* Orientation
* Design Style

Only one template can be selected for each customized product.

---

# 8.9 Image Upload

Customers shall upload images required for customization.

The system shall support:

* Multiple image upload
* Drag and drop upload
* Image preview
* Image removal before submission
* Upload progress indicator

Validation rules:

* Maximum image count depends on the selected template.
* Unsupported file types shall be rejected.
* Oversized files shall be rejected.
* Corrupted images shall be rejected.

Uploaded images are associated only with the current order.

---

# 8.10 Customization Notes

Customers may provide additional design instructions.

Examples include:

* Gift message
* Text to print
* Preferred font
* Preferred colors
* Image arrangement requests
* Special instructions for the designer

These notes are visible to the administrator during the design process.

---

# 8.11 Delivery Address

Customers shall provide delivery details before submitting an order.

Required information:

* Recipient Name
* Mobile Number
* Address Line
* City
* State
* Postal Code
* Landmark (Optional)

Customers may manage multiple saved addresses for future orders.

---

# 8.12 Order Summary

Before payment, the system shall display an order summary including:

* Selected Product
* Selected Variant
* Selected Template
* Uploaded Images Count
* Customization Notes
* Delivery Address
* Quantity
* Total Amount

Customers must review the summary before proceeding.

---

# 8.13 QR Code Payment

The checkout process shall display TagOn's QR code.

The customer shall:

1. Scan the QR code using any UPI application.
2. Complete the payment.
3. Return to the website.
4. Upload the payment screenshot.
5. Optionally enter the UPI Transaction ID.
6. Submit the order.

No payment gateway integration shall be used.

---

# 8.14 Payment Submission

After payment, the customer submits the order.

The system shall:

* Generate a unique Order ID.
* Store uploaded images.
* Store payment screenshot.
* Store customization details.
* Set the order status to **Payment Verification**.

The customer shall receive an order confirmation notification.

---

# 8.15 Customer Dashboard

The dashboard shall display:

* Active Orders
* Completed Orders
* Pending Orders
* Payment Status
* Latest Notifications
* Recent Messages
* Order Statistics

Customers shall be able to open any order directly from the dashboard.

---

# 8.16 Order Details

Each order page shall display:

* Order Number
* Product Details
* Selected Variant
* Selected Template
* Uploaded Images
* Payment Status
* Order Timeline
* Chat Button
* Design Approval Status
* Delivery Information

This page becomes the central workspace for the customer after an order is placed.

---

# 8.17 Customer–Admin Chat

The chat workspace shall become available only after payment verification.

Customers may:

* Send text messages.
* Upload additional reference images if requested.
* Ask design-related questions.
* Respond to administrator messages.
* View complete conversation history.

The chat shall be linked to a specific order.

No global chat shall exist.

---

# 8.18 Design Approval

When the administrator uploads a design preview:

The customer shall receive a notification.

The customer may:

* Approve the design.
* Request design modifications.
* Add comments for revision.

The administrator shall continue updating the design until customer approval is received.

Printing cannot begin until approval is granted.

---

# 8.19 Order Tracking

Customers shall monitor the complete order lifecycle.

Supported statuses include:

* Payment Verification
* Payment Verified
* Designing
* Design Approval Pending
* Approved
* Printing
* Packing
* Shipped
* Delivered
* Cancelled

Each status shall include a timestamp.

---

# 8.20 Notifications

Customers shall receive notifications for:

* Registration Success
* Order Submission
* Payment Verification
* Design Upload
* Revision Request
* Design Approval
* Printing Started
* Packing Completed
* Shipment
* Delivery Confirmation

Notifications shall be available within the application and may also be delivered through email.

---

# 8.21 Profile Management

Customers shall be able to:

* View Profile
* Edit Personal Information
* Change Password
* Manage Saved Addresses
* View Account Activity

Only the account owner may modify profile information.

---

# 8.22 Logout

Customers shall be able to securely log out.

Logging out shall:

* Invalidate the current session.
* Remove authentication tokens from the client.
* Redirect the user to the login page.

Protected pages shall not be accessible after logout.

---

# 8.23 Customer Module Summary

The Customer Module provides a complete end-to-end workflow beginning with user registration and ending with successful order delivery. It combines e-commerce functionality with customization, secure payment submission, order-specific communication, design approval, and delivery tracking. Every interaction is organized around individual orders, ensuring a structured, transparent, and user-friendly experience while giving the business all necessary information to process customized gift orders efficiently.

# 9. Admin Module

## 9.1 Module Overview

The Admin Module provides complete control over the TagOn platform. Administrators manage products, customer orders, payment verification, design approvals, production, delivery tracking, and system settings.

---

## 9.2 Dashboard

The dashboard shall display:

* Total Orders
* Pending Payments
* Active Orders
* Completed Orders
* Total Products
* Customer Count
* Recent Activities

---

## 9.3 Product Management

Administrators can:

* Add Products
* Edit Products
* Delete Products
* Manage Categories
* Manage Variants
* Upload Product Images
* Enable/Disable Customization

---

## 9.4 Template Management

Administrators can:

* Create Templates
* Upload Template Preview Images
* Set Maximum Image Upload Limit
* Assign Templates to Products
* Edit or Delete Templates

---

## 9.5 Order Management

Administrators can:

* View All Orders
* Search & Filter Orders
* Verify Payments
* View Customer Uploads
* Update Order Status
* Cancel Orders
* Generate Order Reports

---

## 9.6 Design Management

After payment verification, administrators shall:

* View uploaded customer images
* Create the customized design
* Upload design preview
* Respond to customer feedback
* Repeat revisions until customer approval

Printing begins only after approval.

---

## 9.7 Customer Communication

Each order contains a dedicated chat.

Administrators can:

* Send messages
* Upload design previews
* Request additional images
* Respond to customer queries

---

## 9.8 Delivery Management

Administrators shall update order status through:

* Designing
* Approval Pending
* Printing
* Packing
* Shipped
* Delivered

Customers receive notifications for every update.

---

## 9.9 Reports

The system shall generate:

* Daily Orders
* Monthly Orders
* Product Sales
* Pending Orders
* Revenue Summary

---

## 9.10 System Settings

Administrators can configure:

* Business Information
* QR Payment Image
* SMTP Settings
* Contact Details
* Social Media Links
* Image Retention Period

---

## 9.11 Admin Module Summary

The Admin Module centralizes all business operations, allowing TagOn to efficiently manage products, customized orders, payments, customer communication, production, and delivery from a single dashboard.

---

# 10. Authentication Module

## 10.1 Module Overview

The Authentication Module secures the application by allowing only authorized users to access protected features.

---

## 10.2 Features

The module shall support:

* User Registration
* User Login
* Logout
* Forgot Password
* Password Reset

---

## 10.3 User Roles

The system supports two roles:

* Customer
* Administrator

Each role has different permissions and access levels.

---

## 10.4 Authentication Process

1. User enters email and password.
2. Credentials are validated.
3. JWT token is generated.
4. User is redirected to the appropriate dashboard.
5. Protected APIs require a valid token.

---

## 10.5 Security

The system shall:

* Encrypt passwords before storage.
* Validate all login requests.
* Protect private routes.
* Expire invalid sessions.
* Prevent unauthorized API access.

---

## 10.6 Validation Rules

* Email must exist.
* Password must match.
* Invalid login attempts return an error.
* Duplicate registrations are not allowed.

---

## 10.7 Authentication Summary

The Authentication Module provides secure user registration, login, role-based authorization, and session management, ensuring that only authenticated users can access protected resources.

# 11. Product Management Module

## Overview

The Product Management Module allows administrators to create and maintain all products available on the platform.

### Features

* Add new products
* Edit product information
* Delete products
* Enable or disable products
* Assign categories
* Add product variants
* Upload product images
* Configure customizable or ready-made products

### Summary

This module ensures that customers always have access to an up-to-date product catalog.

---

# 12. Product Customization Module

## Overview

This module manages customized products that require customer images and template selection.

### Features

* Select product variant
* Select design template
* Upload customer images
* Enter customization notes
* Validate uploaded images
* Store customization details with the order

### Business Rules

* Template selection is mandatory.
* Images are required before payment.
* Customization details cannot be modified after design approval.

### Summary

This module provides all information required for creating personalized gifts.

---

# 13. Template Management Module

## Overview

Templates define the printable layout for customized products.

### Features

* Create template
* Edit template
* Delete template
* Upload template preview
* Define maximum image count
* Assign templates to products

### Summary

Templates standardize the customization process and simplify design creation.

---

# 14. Order Management Module

## Overview

The Order Management Module controls the complete order lifecycle.

### Features

* Create orders
* View orders
* Update order status
* Cancel orders
* View order history
* Search and filter orders

### Order Status

* Payment Verification
* Payment Verified
* Designing
* Approval Pending
* Approved
* Printing
* Packing
* Shipped
* Delivered
* Cancelled

### Summary

Every order progresses through a predefined workflow from creation to delivery.

---

# 15. Payment Module

## Overview

Payments are completed using TagOn's QR code instead of an online payment gateway.

### Features

* Display QR code
* Upload payment screenshot
* Enter transaction ID (optional)
* Manual payment verification
* Payment status updates

### Business Rules

* Orders remain pending until payment verification.
* Design work starts only after payment verification.
* Payment screenshots are stored temporarily.

### Summary

The payment process is simple, cost-effective, and suitable for small businesses.

---

# 16. Chat & Design Approval Module

## Overview

Each customized order includes a dedicated chat workspace for communication between the customer and TagOn.

### Features

* Text messaging
* Image sharing
* Design preview upload
* Revision requests
* Design approval

### Business Rules

* Chat is available only after payment verification.
* Every chat belongs to one order.
* Printing cannot begin until the customer approves the design.

### Summary

This module replaces external communication platforms by keeping all discussions linked to the corresponding order.

---

# 17. Notification Module

## Overview

The Notification Module keeps customers and administrators informed throughout the order process.

### Customer Notifications

* Order submitted
* Payment verified
* Design uploaded
* Revision requested
* Printing started
* Order shipped
* Order delivered

### Admin Notifications

* New order
* Payment received
* New customer message
* Design approval response

### Summary

Notifications improve communication and keep both parties updated on order progress.

---

# 18. File Upload & Storage Module

## Overview

The system manages both permanent business assets and temporary customer files.

### Permanent Files

* Product images
* Template images
* Business logo

### Temporary Files

* Customer uploaded images
* Payment screenshots
* Design preview images

### Business Rules

* Temporary files shall be automatically deleted after the configured retention period.
* Permanent assets shall never be deleted automatically.

### Summary

This module optimizes storage usage while preserving important business information.

---

# 19. Email System

## Overview

The Email System sends automatic emails for important events.

### Emails

* Registration confirmation
* Order confirmation
* Payment verification
* Design uploaded
* Order completed
* Delivery confirmation

### Summary

The email system improves customer communication without requiring manual follow-up.

---

# SRS Conclusion

The Software Requirement Specification defines the complete functional behavior of the TagOn Customized Gift Ordering & Business Management System.

The system consists of customer-facing features for browsing, customization, payment, communication, and order tracking, together with administrative features for product management, payment verification, design approval, production, and delivery management.

This document serves as the primary reference for understanding what the system must accomplish. The implementation details, software architecture, database design, API specifications, project structure, and deployment strategy are intentionally excluded from this document and will be documented separately in the Software Design Document (SDD).
