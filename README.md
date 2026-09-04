# BrainWave Employee Portal

A custom employee portal developed for BrainWave Tech Company to provide secure access to internal services using JWT authentication, Role-Based Access Control (RBAC), PostgreSQL, and Zoho API integration.

## Project Overview

The BrainWave Employee Portal provides a centralized dashboard where employees can log in and access only the services authorized for their role.

The application uses backend-side authentication and permission checking to ensure that users cannot access unauthorized services by directly calling the API.

## Main Features

- JWT-based authentication
- Role-Based Access Control (RBAC)
- Permission-based API authorization
- PostgreSQL database
- Zoho CRM API integration
- Zoho People API integration
- Centralized Zoho OAuth service account
- Secure refresh token management using environment variables
- Admin employee management
- Admin user management
- Audit logging
- Responsive dashboard for desktop and mobile

## Technology Stack

### Frontend

- React.js
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- JWT
- bcrypt
- Axios

### Database

- PostgreSQL

### External Services

- Zoho CRM
- Zoho People
- Zoho OAuth

## System Architecture

```text
Employee
    |
    v
React Frontend
    |
    | JWT
    v
Node.js + Express Backend
    |
    +----------------------+
    |                      |
    v                      v
PostgreSQL             Permission Check
    |                      |
    |                      v
    |                 Authorized?
    |                  /       \
    |                Yes        No
    |                 |          |
    v                 v          v
Users/Roles/      Zoho APIs     403
Permissions
Audit Logs

RBAC Design

The application uses roles and permissions stored in PostgreSQL.

Roles
Role	Authorized Service
Admin	Zoho CRM, Zoho People, Admin features
HR	Zoho People
Sales	Zoho CRM
Support	No Zoho service currently integrated
Finance	No Zoho service currently integrated

Support and Finance roles are included in the RBAC database design for future expansion. The current implementation focuses on Zoho CRM and Zoho People integration.

Permissions

The application includes the following permissions:

view_zoho_people
view_zoho_crm
view_zoho_desk
view_zoho_books
manage_users
manage_roles
manage_permissions
view_audit_logs

The backend checks the user's permission before allowing access to protected resources.

For example:

HR → Zoho People → Allowed
HR → Zoho CRM    → Denied (403)

Sales → Zoho CRM    → Allowed
Sales → Zoho People → Denied (403)
Authentication

The login process works as follows:

User enters email and password.
Backend verifies the password using bcrypt.
Backend identifies the user's assigned role.
A JWT is generated.
The frontend stores the JWT.
Protected API requests send the JWT using the Authorization header.
Backend validates the JWT before processing the request.

Example:

Authorization: Bearer <JWT_TOKEN>

Requests without a valid token are rejected with HTTP 401 Unauthorized.

Zoho OAuth Integration

The application uses a centralized backend Zoho service account.

Employees do not enter their individual Zoho credentials.

Employee
    |
    v
BrainWave Portal
    |
    v
Backend
    |
    v
Zoho OAuth
    |
    +----------------------+
    |                      |
    v                      v
Zoho CRM              Zoho People

The Zoho client credentials and refresh token are stored in the backend .env file and are never exposed to the frontend.

The backend generates Zoho access tokens using the refresh token and caches the access token until it is close to expiration. This reduces unnecessary OAuth token requests.

Zoho CRM

Authorized users can access Zoho CRM lead information through the portal.

The CRM integration retrieves information such as:

Lead Name
Email
Company
Phone

The endpoint is protected using both JWT authentication and the required RBAC permission.

CRM API Endpoint
GET /api/zoho/leads

Required permission:

view_zoho_crm
Zoho People

HR and Admin users can access employee records from Zoho People through the portal.

The portal displays information such as:

Employee ID
Employee Name
Email
Designation

Zoho People access is protected by backend permission checking.

Zoho People API Endpoint
GET /api/zoho/people/employees

Required permission:

view_zoho_people
Admin Features

Administrators have access to additional management features.

Employee Management

Admin users can:

Add employees
View employees
Edit employee information
Delete employees
Manage employment status
User Management

Administrators can view portal users and their assigned roles.

Audit Logs

Important activities are recorded in the audit log, including:

Employee creation
Employee updates
Employee deletion
Zoho CRM access
Zoho People access

Audit records contain information such as:

User
Action
Resource
Details
IP address
Timestamp
Database Structure

The PostgreSQL database contains the following tables:

users
roles
permissions
user_roles
role_permissions
employees
audit_logs

The relationship between users, roles, and permissions allows the application to control access without relying only on frontend restrictions.

API Structure
Authentication
POST /api/auth/login
GET  /api/auth/me
Employees
GET    /api/employees
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id
Users
GET /api/users
Audit Logs
GET /api/audit-logs
Zoho
GET /api/zoho/leads
GET /api/zoho/people/employees

Protected endpoints require a valid JWT and the appropriate permission.

Security

The application follows several security practices:

Passwords are stored as bcrypt hashes.
JWT secret is stored in environment variables.
Zoho client credentials are stored in environment variables.
Zoho refresh token is stored in environment variables.
.env files are excluded from Git.
node_modules is excluded from Git.
Backend authorization prevents unauthorized direct API access.
Employees do not receive or enter Zoho OAuth credentials.
Frontend service visibility is based on the user's role.
Backend permission checks provide the actual access control.
Running the Project Locally
Prerequisites

Make sure the following are installed:

Node.js
npm
PostgreSQL
Git
Backend Setup

Open a terminal in the project directory:

cd backend
npm install
npm run dev

The backend runs on:

http://localhost:5000
Frontend Setup

Open another terminal:

cd frontend
npm install
npm run dev

The frontend runs on the Vite development server, normally:

http://localhost:5173
Environment Variables

Create a .env file inside the backend directory.

Example:

DB_HOST=localhost
DB_PORT=5432
DB_NAME=brainwave_portal
DB_USER=your_database_user
DB_PASSWORD=your_database_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h

ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token
ZOHO_ACCOUNTS_URL=https://accounts.zoho.in

Do not commit the .env file to GitHub.

Testing RBAC

The following authorization scenarios were tested during development:

Test	Expected Result
Admin → Zoho CRM	Allowed
Admin → Zoho People	Allowed
HR → Zoho People	Allowed
HR → Zoho CRM	403 Forbidden
Sales → Zoho CRM	Allowed
Sales → Zoho People	403 Forbidden
Protected API without JWT	401 Unauthorized

These tests demonstrate that authorization is enforced at the backend level and not only through frontend button visibility.

Project Structure
custom-employee-portal/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auditController.js
│   │   │   ├── authController.js
│   │   │   ├── employeeController.js
│   │   │   ├── userController.js
│   │   │   └── zohoController.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   ├── permissionMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auditRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── employeeRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── zohoRoutes.js
│   │   │
│   │   └── services/
│   │       ├── auditService.js
│   │       └── zohoService.js
│   │
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── assets/
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md

Future Improvements
Integration with additional Zoho services such as Zoho Desk and Zoho Books
More advanced admin role and permission management
Improved dashboard analytics
Production deployment
Automated testing
Pagination and filtering for large employee and audit datasets
Author

Developed as a college project for the BrainWave Tech Company assignment.