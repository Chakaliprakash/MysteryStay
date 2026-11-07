# MysteryStay — Architecture Specification

> **Project**: MysteryStay  
> **Tagline**: Discover Hidden Stays. Unlock Better Deals.  
> **Founder & Developer**: Prakash Chakali  
> **Architecture Style**: Production-Grade Modular Monolith (Single Deployable Unit)  
> **Core Backend Stack**: Java 21 LTS, Spring Boot 3.3.5, Spring Security, Spring Data JPA, Hibernate, MySQL 8.4/9.x, Flyway, Redis  
> **Core Frontend Stack**: React 18, JavaScript, Vite, Tailwind CSS, React Router v6, Framer Motion, Recharts, Lucide React

---

## 1. Architectural Philosophy: The Modular Monolith

MysteryStay is intentionally built as a **Modular Monolith** rather than premature distributed microservices.

### Key Engineering Justifications
1. **Zero Premature Distributed Complexity**: Avoids distributed network latency, two-phase commits, distributed saga orchestrations, distributed locks across network partitions, and Kubernetes cluster overhead.
2. **Strict Encapsulation**: Domain business logic and persistence repositories are strictly isolated per module. No cross-repository queries or direct entity manipulations are permitted.
3. **Explicit Service Contracts**: Modules communicate solely through public service interfaces (e.g. `BookingService.confirmBooking()`, `InventoryService.lockInventory()`).
4. **Clean Extraction Path**: If the Search or Booking modules experience exponential traffic, they can be extracted into independent microservices with minimal refactoring because bounded contexts are enforced in code.

```mermaid
flowchart TD
    Client["React 18 SPA (Vite + Tailwind CSS + Framer Motion)"] -->|REST /api/v1 (JWT Auth)| SecurityFilter["Spring Security Stateless Filter Chain"]
    
    SecurityFilter --> AuthMod["auth & user Module"]
    SecurityFilter --> DealMod["deal & search Module (DSA Inverted Index)"]
    SecurityFilter --> BookingMod["booking Module (Pessimistic DB Locks)"]
    SecurityFilter --> PayMod["payment Module (Razorpay HMAC-SHA256)"]
    SecurityFilter --> AdminMod["admin & hotel Module"]

    DealMod -->|Service Interface| HotelMod["hotel Module (Identity Masked)"]
    DealMod -->|Service Interface| InvMod["inventory Module (Daily Ledger)"]
    BookingMod -->|@Lock PESSIMISTIC_WRITE| InvMod
    PayMod -->|Transactional Confirm Hook| BookingMod
    BookingMod -.->|Hold Sweeper (Scheduled)| BookingMod
```

---

## 2. Module Boundaries & Contract Enforcement

| Module | Primary Responsibility | Direct Tables Owned | Exposed Service Interface |
|---|---|---|---|
| **auth** | User registration, BCrypt hashing (strength 12), JWT generation, opaque refresh token rotation. | `users`, `refresh_tokens` | `AuthService` |
| **user** | Profile management, role enforcement (`ROLE_CUSTOMER`, `ROLE_HOTEL_MANAGER`, `ROLE_ADMIN`). | `users` | `UserService` |
| **hotel** | Hotel onboarding, address, GPS coordinates, verification status, contact details. | `hotels`, `amenities`, `hotel_amenities` | `HotelService` |
| **inventory** | Room category retail pricing, daily room availability calendar, capacity tracking. | `room_types`, `room_inventories` | `InventoryService` |
| **deal** | Unsold inventory monetization, discount range enforcement (20%–70%), clue generation, identity masking. | `mystery_deals` | `DealService` |
| **search** | High-performance DSA ranking via Bounded Min-Heap (`PriorityQueue`), Inverted Index, Sliding Window stay optimizer. | Read models / In-memory indexes | `SearchService`, `DsaService` |
| **booking** | State machine (`PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED`, `EXPIRED`), pessimistic row locking, 15-min hold sweeper. | `bookings` | `BookingService` |
| **payment** | Razorpay sandbox orders, cryptographic HMAC-SHA256 signature verification, idempotency guard, asynchronous webhook capture. | `payments` | `PaymentService` |
| **admin** | Platform-wide volume auditing, hotel partner compliance ledger, verify & suspend workflows. | Cross-module admin views | `AdminService` |

---

## 3. Concurrency & High-Throughput Strategy

- **Pessimistic Row-Level Locking (`PESSIMISTIC_WRITE`)**:
  - When reserving rooms during flash mystery sales, `InventoryRepository` executes:
    ```sql
    SELECT * FROM room_inventories WHERE id = ? FOR UPDATE;
    ```
  - This serializes concurrent booking requests at the database engine level, preventing room overselling and double bookings. Tested with 10 concurrent competing threads for 1 available room: exactly 1 succeeds, 9 receive 409 Conflict.
- **15-Minute Expiration Hold Sweeper**:
  - Unpaid bookings in `PENDING_PAYMENT` state automatically expire after 15 minutes via `BookingExpirationWorker` running `@Scheduled(fixedDelay = 60000)`, automatically restoring locked rooms to available inventory.
- **Cryptographic Payment Idempotency**:
  - Payment verification checks Razorpay Order ID uniqueness and constant-time HMAC-SHA256 signatures (`MessageDigest.isEqual`), preventing duplicate transaction execution or replayed webhook callbacks.

---

## 4. Interview Defense Guide

### Q1: Why a Modular Monolith instead of Microservices?
> *"For MysteryStay's current scale, a Modular Monolith provides compile-time module boundary safety, zero network latency between services, atomic local database transactions, and zero distributed system failure modes (like two-phase commit overhead or partial failures). Because each module owns its domain repository and communicates solely via explicit service interfaces, extracting any module into a microservice in the future requires minimal refactoring."*

### Q2: How is Double-Booking prevented under high concurrency?
> *"We combine two safeguards: first, a database check constraint (`available_rooms >= 0`); second, pessimistic write locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)` which translates to MySQL's `SELECT ... FOR UPDATE`). When a reservation is initiated, the relevant daily inventory rows are locked within the transaction, guaranteeing that concurrent requests cannot read stale availability."*

### Q3: How is rate parity protected for partner hotels?
> *"Hotels cannot publicly offer cheaper rates without breaching standard OTA contracts (Expedia, Booking.com). MysteryStay solves this through our Identity Masking Pipeline: deals are indexed and browsed strictly by clues (neighborhood, star rating, luxury amenity clues, and room category). The true brand name, street address, and phone coordinates are only revealed post-booking once a verified payment confirmation hook triggers `booking.confirm()`."*
