# Detailed Project Report

## Vehicle Rental Management System

**Project type:** Full-stack web application  
**Repository:** `vehicle-rental-management-system`  
**Report basis:** Source-code review of the client and server applications  
**Current implementation status:** Working prototype with renter, vehicle-owner, and administrator workflows

---

## 1. Executive Summary

The Vehicle Rental Management System is a web-based platform for discovering, listing, approving, and booking rental vehicles. It connects customers who need a vehicle with vehicle owners who supply vehicles, while giving administrators oversight of inventory, users, bookings, approvals, and operational metrics.

The system is implemented as a separate React/Vite frontend and Node.js/Express backend. MongoDB, accessed through Mongoose, stores users, vehicles, and bookings. ImageKit provides hosted image storage and optimized image URLs for vehicle and profile images. The application uses JWT-based login sessions, role-aware navigation, and REST-style API routes.

The current system supports:

- User registration and login.
- Three roles: `user`, `owner`, and `admin`.
- Public browsing of approved and available vehicles.
- Vehicle-owner inventory management.
- Administrative vehicle approval and platform oversight.
- Date-range availability checks.
- Daily, weekly, and monthly rental pricing.
- Booking creation and booking-status management.
- Owner and administrator dashboards with operational statistics.
- Hosted image uploads and image optimization through ImageKit.

The application is suitable as an academic project, proof of concept, or foundation for a production rental marketplace. Before production deployment, authentication verification, authorization enforcement, validation, concurrency handling, testing, observability, and deployment configuration should be strengthened.

---

## 2. Background and Problem Statement

Traditional vehicle rental operations often depend on manual records, phone calls, spreadsheets, and disconnected communication between customers, vehicle owners, and administrators. These approaches make it difficult to:

- Know which vehicles are available for a requested period.
- Maintain accurate vehicle and owner records.
- Prevent conflicting reservations.
- Track booking status and revenue.
- Give customers a convenient self-service booking experience.
- Provide administrators with a current view of platform activity.

This project addresses those problems through a centralized web application. Vehicle information, availability, rental prices, user roles, and booking records are stored in a shared database and exposed through role-specific workflows.

---

## 3. Project Objectives

### 3.1 Primary objectives

1. Provide customers with a clear vehicle discovery and booking experience.
2. Allow owners to publish and manage their rental inventory.
3. Require administrative approval before vehicles become publicly bookable.
4. Check date-range availability before accepting a booking.
5. Calculate rental prices based on the selected rental duration.
6. Provide booking visibility to customers, owners, and administrators.
7. Provide dashboards that summarize inventory, bookings, revenue, and usage.
8. Store vehicle and profile imagery using an external image service.

### 3.2 Secondary objectives

- Keep the frontend and backend independently deployable.
- Centralize frontend authentication and shared application state.
- Use a document database model that can be extended with more vehicle or booking attributes.
- Create a basis for future payments, notifications, reporting, and search improvements.

---

## 4. Scope

### 4.1 Included in the current implementation

- React single-page frontend.
- Express REST API.
- MongoDB persistence using Mongoose.
- User registration and login.
- Role-aware user experience for renters, owners, and administrators.
- Vehicle listing, detail view, and search by location/date availability.
- Owner vehicle creation, editing, availability toggling, and soft removal.
- Admin vehicle approval, availability control, and soft removal.
- Booking creation, retrieval, and status changes.
- Owner and admin dashboards.
- ImageKit upload and transformation integration.
- Session storage of the client token for browser refresh persistence.

### 4.2 Outside the current scope

The source code does not currently show implementation for:

- Online payment processing or refunds.
- Driver-license verification.
- Identity verification or KYC.
- Automated email, SMS, or push notifications.
- Reviews and ratings.
- Customer support/ticketing.
- Vehicle maintenance scheduling.
- Geolocation, maps, or distance calculation.
- Formal audit logs.
- Automated test suites.
- Infrastructure-as-code or deployment manifests.

---

## 5. Stakeholders and User Roles

| Role | Responsibilities | Main capabilities |
|---|---|---|
| Customer (`user`) | Find and reserve vehicles | Browse vehicles, inspect details, create bookings, view personal bookings |
| Vehicle owner (`owner`) | Supply and operate rental inventory | Add, edit, remove, enable/disable vehicles, view bookings, update booking status, view owner metrics |
| Administrator (`admin`) | Govern the marketplace | Approve vehicles, manage platform inventory, inspect users/bookings, change booking status, view platform metrics |

The frontend redirects users based on their role. Renter-facing pages display the public navigation and footer, while owner and administrator areas use their own layouts and sidebars.

---

## 6. Functional Requirements

### FR-01: Account registration

The system shall allow a new user to register with a name, email address, and password. The account model supports the roles `user`, `owner`, and `admin`.

### FR-02: Account login

The system shall authenticate a registered user using email and password, compare the submitted password with the bcrypt hash, and issue a JWT on success.

### FR-03: Vehicle discovery

The system shall display vehicles that are both available and approved. Vehicle records include type, brand, model, image, year, category, seating capacity, fuel type, transmission, pricing, location, and description.

### FR-04: Availability search

The system shall accept a location and pickup/return date range, identify vehicles in that location that are currently available, and exclude vehicles with overlapping bookings.

### FR-05: Vehicle listing management

An owner shall be able to add a vehicle with an image and edit, enable/disable, or remove an owned vehicle.

### FR-06: Administrative approval

An administrator shall be able to approve or reject a vehicle. Public vehicle retrieval only returns approved and available vehicles.

### FR-07: Booking creation

An authenticated customer shall be able to select a vehicle, rental duration, pickup date, and return date to create a booking.

### FR-08: Pricing

The system shall calculate a booking price using daily, weekly, or monthly pricing. If weekly or monthly prices are missing, the system falls back to daily pricing multiplied by the relevant period count.

### FR-09: Booking status management

Owners shall be able to update bookings for their vehicles. Administrators shall be able to update any booking. The booking schema supports `pending`, `confirmed`, and `cancelled`.

### FR-10: Dashboards

The owner dashboard shall show vehicle and booking totals, pending and confirmed booking counts, recent bookings, and an owner revenue calculation. The administrator dashboard shall show platform inventory, users, bookings, revenue, conversion, utilization, conflict, duration, and active-user metrics.

---

## 7. Non-Functional Requirements

### Performance

- Use indexed database fields for frequent lookups as usage grows.
- Avoid loading unnecessarily large image files in the browser.
- Keep dashboard aggregations efficient for larger booking volumes.

### Security

- Hash passwords before persistence.
- Protect private API routes with authentication middleware.
- Enforce role and ownership checks at the server boundary.
- Validate request bodies, file types, dates, identifiers, and status values.
- Keep database and image-service credentials in environment variables.

### Usability

- Provide separate navigation and dashboards for each role.
- Show loading states and toast-based success/error feedback.
- Present vehicle details, pricing, and booking controls in one workflow.

### Maintainability

- Keep controllers, routes, models, middleware, and configuration separated.
- Use shared frontend context for authentication, vehicles, dates, and API access.
- Keep API paths grouped by responsibility: `/api/user`, `/api/owner`, `/api/admin`, and `/api/bookings`.

### Availability and recovery

- Return structured JSON responses with a `success` field.
- Add centralized error handling and logging before production use.
- Define database backup and image recovery procedures before launch.

---

## 8. System Architecture

### 8.1 Logical architecture

```text
+---------------------+       HTTP/JSON       +----------------------+
| React/Vite Client   | <-------------------> | Express REST API     |
| - public pages      |                       | - routes             |
| - owner portal      |                       | - controllers        |
| - admin portal      |                       | - auth middleware    |
| - AppContext        |                       | - upload middleware  |
+----------+----------+                       +-----+-----------+----+
           |                                        |           |
           | image URLs                             |           |
           v                                        v           v
+---------------------+                       +---------+   +-----------+
| Browser session     |                       | MongoDB |   | ImageKit  |
| sessionStorage JWT  |                       | data    |   | media CDN |
+---------------------+                       +---------+   +-----------+
```

### 8.2 Frontend architecture

The client is a React application bootstrapped with Vite. `App.jsx` defines route-level composition, while `AppContext.jsx` centralizes:

- API base URL configuration through `VITE_BASE_URL`.
- Currency configuration through `VITE_CURRENCY`.
- Authentication state and role flags.
- Vehicle retrieval and shared vehicle state.
- Pickup and return date state.
- Login modal visibility.
- Logout behavior and navigation.

The client uses React Router for public, owner, and administrator pages. Axios is configured with a shared base URL and an authorization header when a session token exists. Motion is used for selected page and component transitions, and `react-hot-toast` provides feedback messages.

### 8.3 Backend architecture

The server is an Express application that:

1. Loads environment configuration.
2. Connects to MongoDB.
3. Enables CORS and JSON parsing.
4. Registers user, owner, admin, and booking routers.
5. Starts on `PORT`, defaulting to port `3000`.

Controllers contain business logic, Mongoose models define persistence structures, middleware handles authentication and multipart uploads, and configuration modules initialize MongoDB and ImageKit.

---

## 9. Technology Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 |
| Frontend build tool | Vite 8 |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 4 with Vite integration |
| HTTP client | Axios |
| UI feedback | React Hot Toast |
| Animation | Motion |
| Backend runtime | Node.js |
| Backend framework | Express 5 |
| Database | MongoDB |
| ODM | Mongoose 9 |
| Authentication | JSON Web Tokens and bcrypt |
| Multipart upload | Multer |
| Image storage/CDN | ImageKit |
| Development reload | Nodemon |

---

## 10. Data Model

### 10.1 User

Collection/model: `User`

| Field | Type | Notes |
|---|---|---|
| `role` | String | `owner`, `user`, or `admin`; defaults to `user` |
| `name` | String | Required |
| `email` | String | Required and unique |
| `password` | String | Required; stored as a bcrypt hash during normal registration |
| `image` | String | Optional hosted profile image URL |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

### 10.2 Vehicle

Collection/model: `Vehicle`

| Field | Type | Notes |
|---|---|---|
| `owner` | ObjectId | Reference to `User` |
| `vehicleType` | String | Required vehicle type |
| `vehicleNumber` | String | Optional registration/vehicle number |
| `brand`, `model` | String | Required identity fields |
| `image` | String | Required ImageKit URL |
| `year` | Number | Required |
| `category` | String | Required |
| `seating_capacity` | Number | Required |
| `fuel_type` | String | Required |
| `transmission` | String | Required |
| `pricePerDay` | Number | Required |
| `pricePerWeek`, `pricePerMonth` | Number | Optional fallback pricing |
| `location` | String | Required search location |
| `description` | String | Required |
| `isAvailable` | Boolean | Defaults to `true` |
| `isApproved` | Boolean | Defaults to `false` |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

### 10.3 Booking

Collection/model: `Booking`

| Field | Type | Notes |
|---|---|---|
| `vehicle` | ObjectId | Required reference to `Vehicle` |
| `user` | ObjectId | Required reference to renter `User` |
| `owner` | ObjectId | Required reference to vehicle owner |
| `pickupDate`, `returnDate` | Date | Required rental range |
| `rentalDuration` | String | `daily`, `weekly`, or `monthly` |
| `status` | String | `pending`, `confirmed`, or `cancelled` |
| `price` | Number | Calculated at booking creation |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

### 10.4 Legacy model observation

The repository also contains a `Car` model with a schema similar to `Vehicle`. The current route/controller structure uses `Vehicle`; the `Car` model appears to be legacy or partially migrated and should either be removed or clearly separated if car-specific functionality is reintroduced.

---

## 11. Main Application Workflows

### 11.1 Customer booking workflow

1. Customer opens the public home or vehicles page.
2. Client fetches approved and available vehicles from `/api/user/vehicles`.
3. Customer selects a vehicle and opens its detail page.
4. Customer chooses daily, weekly, or monthly rental duration.
5. Customer enters pickup and return dates.
6. Client posts the booking to `/api/bookings/create`.
7. Server checks for overlapping bookings and verifies that the vehicle is approved and available.
8. Server calculates the price and creates a pending booking.
9. Customer is redirected to the personal bookings page.

### 11.2 Owner inventory workflow

1. Owner enters the owner portal.
2. Owner submits vehicle details and an image.
3. Server uploads the image to ImageKit and stores the optimized URL.
4. Server creates the vehicle with `isApproved: false`.
5. Administrator reviews and approves the vehicle.
6. Owner can edit the vehicle, toggle availability, or perform a soft removal.
7. Owner reviews incoming bookings and changes their status.
8. Owner dashboard displays inventory and booking performance.

### 11.3 Administrator governance workflow

1. Administrator enters the admin portal.
2. Administrator reviews vehicle inventory and owner information.
3. Administrator approves or rejects vehicles.
4. Administrator can toggle vehicle availability or soft-remove a vehicle.
5. Administrator reviews users and all bookings.
6. Administrator can change booking status.
7. Dashboard metrics help monitor conversion, utilization, booking conflicts, rental duration, revenue, and active users.

### 11.4 Image upload workflow

1. Frontend sends multipart form data.
2. Multer stores the incoming file temporarily.
3. Controller reads the temporary file and uploads it to ImageKit.
4. ImageKit URL transformation requests a resized, compressed WebP image.
5. The optimized URL is saved in the user or vehicle document.

---

## 12. API Inventory

### User routes: `/api/user`

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| `POST` | `/register` | No | Register an account |
| `POST` | `/login` | No | Authenticate a user |
| `GET` | `/data` | Yes | Return authenticated user data |
| `GET` | `/vehicles` | No | Return approved and available vehicles |

### Owner routes: `/api/owner`

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| `POST` | `/add-vehicle` | Yes + upload | Create a vehicle |
| `GET` | `/vehicles` | Yes | List owner vehicles |
| `GET` | `/vehicle/:vehicleId` | Yes | Get one owned vehicle |
| `PUT` | `/update-vehicle/:vehicleId` | Yes + optional upload | Update a vehicle |
| `POST` | `/toggle-vehicle` | Yes | Toggle owner vehicle availability |
| `POST` | `/delete-vehicle` | Yes | Soft-remove a vehicle |
| `POST` | `/update-image` | Yes + upload | Update owner profile image |
| `GET` | `/dashboard` | Yes | Return owner dashboard data |

### Admin routes: `/api/admin`

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| `GET` | `/dashboard` | Yes, admin role | Return admin dashboard data |
| `GET` | `/vehicles` | Yes, admin role | List all vehicles |
| `POST` | `/toggle-vehicle` | Yes, admin role | Toggle any vehicle availability |
| `POST` | `/approve-vehicle` | Yes, admin role | Set vehicle approval state |
| `POST` | `/delete-vehicle` | Yes, admin role | Soft-remove a vehicle |
| `GET` | `/bookings` | Yes, admin role | List all bookings |
| `GET` | `/users` | Yes, admin role | List non-admin users with vehicle counts |
| `POST` | `/change-booking-status` | Yes, admin role | Change a booking status |
| `POST` | `/update-image` | Yes, admin role + upload | Update admin profile image |

### Booking routes: `/api/bookings`

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| `POST` | `/check-availability` | No | Search available vehicles by location/date |
| `POST` | `/create` | Yes | Create a booking |
| `GET` | `/user` | Yes | List the current user's bookings |
| `GET` | `/owner` | Yes, owner role | List an owner's bookings |
| `POST` | `/change-status` | Yes, owner ownership check | Change a booking status |

The root endpoint `GET /` returns `Server is running` as a basic health indication.

---

## 13. Pricing and Availability Logic

### 13.1 Daily pricing

For a daily rental, the server calculates:

```text
price = pricePerDay * max(1, ceil(returnDate - pickupDate in days))
```

### 13.2 Weekly pricing

For a weekly rental, the server uses the vehicle's configured weekly price. If that value is missing or zero, it falls back to:

```text
price = pricePerDay * ceil(totalDays / 7)
```

### 13.3 Monthly pricing

For a monthly rental, the server uses the vehicle's configured monthly price. If that value is missing or zero, it falls back to:

```text
price = pricePerDay * ceil(totalDays / 30)
```

### 13.4 Overlap detection

A booking is treated as overlapping when:

```text
existing.pickupDate <= requested.returnDate
AND existing.returnDate >= requested.pickupDate
```

The current implementation checks all bookings for the vehicle. A production implementation should exclude cancelled bookings and use a transaction or another concurrency-control strategy to prevent two simultaneous requests from reserving the same vehicle.

---

## 14. Project Structure

```text
vehicle-rental-management-system/
|-- client/
|   |-- src/
|   |   |-- App.jsx
|   |   |-- index.css
|   |   |-- main.jsx
|   |   |-- assets/
|   |   |-- components/
|   |   |   |-- admin/
|   |   |   |-- owner/
|   |   |-- context/
|   |   |-- pages/
|   |       |-- admin/
|   |       |-- owner/
|   |-- package.json
|   |-- vite.config.js
|-- server/
|   |-- configs/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- server.js
|   |-- package.json
|-- DETAILED_PROJECT_REPORT.md
```

---

## 15. Local Setup and Execution

### 15.1 Prerequisites

- Node.js and npm.
- A running MongoDB deployment.
- An ImageKit account and credentials for image upload functionality.
- Environment files containing the required database, JWT, ImageKit, API URL, and currency settings.

### 15.2 Server setup

```bash
cd server
npm install
npm run server
```

The server uses `PORT` from the environment, or `3000` by default.

### 15.3 Client setup

```bash
cd client
npm install
npm run dev
```

The client uses `VITE_BASE_URL` for the backend base URL and `VITE_CURRENCY` for displayed prices.

### 15.4 Production client build

```bash
cd client
npm run build
npm run preview
```

### 15.5 Environment configuration checklist

The following values are referenced by the source code and should be configured outside version control:

```text
# server
MONGODB_URI=
JWT_SECRET=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
PORT=

# client
VITE_BASE_URL=
VITE_CURRENCY=
```

The exact environment-file names and deployment-specific values should be documented in a separate setup guide before handoff.

---

## 16. Security and Reliability Assessment

### 16.1 Positive controls already present

- Passwords are hashed with bcrypt during registration.
- Password fields are excluded from user and owner booking query results where explicitly selected.
- Owner operations check that the target vehicle belongs to the authenticated owner.
- Administrator operations use an `ensureAdmin` role check.
- Public vehicle retrieval requires both availability and approval.
- Secrets are referenced through environment variables rather than hard-coded values.
- Session tokens are held in `sessionStorage` by the current frontend implementation.

### 16.2 High-priority remediation items

1. **Verify JWT signatures.** The authentication middleware currently calls `jwt.decode`, which reads token content without cryptographic verification. It should use `jwt.verify(token, process.env.JWT_SECRET)` and reject expired or tampered tokens.
2. **Prevent client-selected privileged roles.** Registration currently accepts `role` from the request body. Public registration should force the default `user` role; owner/admin provisioning should use a protected workflow.
3. **Strengthen authorization at the route boundary.** `protect` authenticates users, but role enforcement is partly performed inside controllers. Dedicated `requireRole` middleware would make authorization consistent and easier to audit.
4. **Validate booking dates.** Reject missing, malformed, past, or reversed date ranges before availability checks and price calculation.
5. **Exclude cancelled bookings from availability checks.** Cancelled bookings should not continue blocking a vehicle.
6. **Protect against booking races.** The current availability check followed by create operation is not atomic. Concurrent requests can both pass the check. Use a transaction, reservation lock, or a data model/indexing strategy suitable for the chosen booking rules.
7. **Validate file uploads.** Restrict MIME types, file extensions, size, image dimensions, and upload counts. Ensure temporary files are removed after processing.
8. **Add rate limiting and security headers.** Login, registration, uploads, and booking endpoints need abuse controls before internet exposure.
9. **Centralize error handling.** Replace repeated `console.log` and JSON error handling with a consistent error middleware and structured logging.
10. **Avoid leaking operational details.** Return user-safe messages while recording diagnostic details in protected server logs.

### 16.3 Data integrity recommendations

- Add indexes for `User.email`, `Vehicle.location`, `Vehicle.isAvailable`, `Vehicle.isApproved`, and booking lookup fields.
- Add explicit validation for non-negative prices and valid seating/year values.
- Define behavior for deleted owners and their active bookings.
- Decide whether vehicle removal should be represented by a dedicated `deletedAt` field instead of nulling the owner reference.
- Add audit metadata for approvals and booking status changes.

---

## 17. Testing and Quality Plan

No automated test suite is visible in the current project structure. The following test layers are recommended.

### 17.1 Unit tests

- Daily, weekly, and monthly price calculations.
- Date-range validation.
- Booking overlap detection.
- Dashboard revenue and utilization calculations.
- Role and ownership predicates.

### 17.2 API integration tests

- Registration and duplicate-email handling.
- Login success and invalid credentials.
- Access to protected routes without a token.
- Access to owner/admin routes with the wrong role.
- Vehicle approval and public visibility.
- Booking creation for available and unavailable vehicles.
- Booking status transitions.
- Multipart image upload validation.

### 17.3 Frontend tests

- Role-based redirects from the root route.
- Vehicle list and detail rendering.
- Login modal behavior.
- Booking form validation and success/error states.
- Owner and admin navigation.
- Loading and empty states.

### 17.4 End-to-end scenarios

1. Register/login as a renter, browse an approved vehicle, and create a booking.
2. Login as an owner, add a vehicle, and verify it is not publicly visible before approval.
3. Login as an administrator, approve the vehicle, and verify it becomes publicly visible.
4. Confirm a booking as the owner and verify dashboard metrics change.
5. Cancel a booking and verify the vehicle can be searched for the same dates after the cancellation rules are implemented.

### 17.5 Existing quality commands

Client commands currently defined in `client/package.json`:

```bash
npm run lint
npm run build
```

The server package defines:

```bash
npm run server
npm start
```

A CI pipeline should run linting, client build validation, API tests, and dependency/security checks on every change.

---

## 18. Known Limitations and Technical Debt

- Authentication verification needs to be corrected from decode-only behavior to signature verification.
- Role assignment during registration is too permissive for a public endpoint.
- Availability checks do not currently filter out cancelled bookings.
- Booking creation is vulnerable to concurrent reservation races.
- Client-side route visibility does not replace server-side authorization.
- Date and numeric input validation is not comprehensive.
- Payment and refund workflows are absent.
- Notification and communication workflows are absent.
- The `Car` model is not integrated with the active vehicle workflow.
- Upload cleanup, file restrictions, and centralized error handling need hardening.
- Automated tests and CI configuration are not present in the repository structure.
- Dashboard values labeled as monthly revenue are derived from all confirmed bookings in the queried dataset and then split using fixed owner/admin percentages; a true calendar-month revenue query and an explicit commission model would be more precise.
- The frontend and server README files contain only minimal setup notes and should be expanded with environment examples and API documentation.

---

## 19. Recommended Development Roadmap

### Phase 1: Security and correctness

- Replace JWT decoding with JWT verification.
- Force public registration to create only customer accounts.
- Add reusable role middleware.
- Validate dates, identifiers, prices, and upload files.
- Exclude cancelled bookings from availability queries.
- Add tests for authentication, authorization, price calculation, and booking overlap.

### Phase 2: Operational quality

- Add centralized error handling and structured logs.
- Add database indexes and pagination for vehicles, users, and bookings.
- Add audit fields for approval and status changes.
- Add transactional or lock-based booking creation.
- Improve empty, loading, and failure states in the client.
- Add environment templates and deployment documentation.

### Phase 3: Marketplace capabilities

- Integrate payment authorization, capture, cancellation, and refunds.
- Add email/SMS booking notifications.
- Add customer cancellation rules and owner response deadlines.
- Add reviews, ratings, and dispute handling.
- Add advanced filtering by vehicle type, price, category, fuel, transmission, and seating.

### Phase 4: Scale and analytics

- Add background jobs for notifications and image processing.
- Introduce operational monitoring and alerting.
- Move complex dashboard calculations to aggregation pipelines or reporting jobs.
- Add geographic search and map-based pickup locations.
- Establish backups, disaster recovery, and deployment automation.

---

## 20. Conclusion

The Vehicle Rental Management System provides a coherent foundation for a multi-role rental marketplace. Its strongest current capabilities are the separation of renter, owner, and admin experiences; owner-managed inventory; administrative approval; hosted image handling; booking date checks; and dashboard visibility.

The most important next step is to harden the trust boundary around authentication and authorization, followed by date validation and concurrency-safe booking creation. Once those concerns are addressed and automated tests are introduced, the project will be in a stronger position for payment integration, production deployment, and further marketplace functionality.

---

## Appendix A: Source Areas Reviewed

- Client route composition: `client/src/App.jsx`
- Shared client state and API setup: `client/src/context/AppContext.jsx`
- Vehicle detail and booking form: `client/src/pages/VehicleDetails.jsx`
- Server bootstrap: `server/server.js`
- Authentication: `server/controllers/userController.js`, `server/middleware/auth.js`
- Booking logic: `server/controllers/bookingController.js`, `server/models/Booking.js`
- Owner operations: `server/controllers/ownerController.js`
- Administrator operations: `server/controllers/adminController.js`
- Persistence models: `server/models/User.js`, `server/models/Vehicle.js`, `server/models/Car.js`
- API route declarations: `server/routes/`
- External services: `server/configs/db.js`, `server/configs/imageKit.js`
