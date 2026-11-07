# MysteryStay — Development Roadmap

## Phase Tracker

- [x] **Phase 1: Foundation and Environment Setup**
  - Modular monolith project layout (`backend/`, `frontend/`, `docker/`, `docs/`)
  - Spring Boot 3.3.5, Java 21, Maven 3.10 setup
  - Local MySQL connection and Flyway migration V1
  - Automated smoke & health tests (`mvn test`)
  - React + Vite + Tailwind CSS frontend scaffold with health ping UI
  - Multi-stage Docker configuration

- [x] **Phase 2: Authentication & Authorization**
  - Flyway migration `V2__auth_and_user_schema.sql` (`users`, `refresh_tokens`)
  - User registration, BCrypt password hashing (strength 12)
  - JWT token generation (15-min access), opaque refresh tokens (7-day rotation)
  - Spring Security 6 stateless filter chain & custom 401/403 JSON handlers
  - Role-Based Access Control (`ROLE_CUSTOMER`, `ROLE_HOTEL_MANAGER`, `ROLE_ADMIN`)
  - Mockito unit tests and MockMvc integration tests (10/10 test suite passing)
  - Interactive auth testbench in React frontend

- [x] **Phase 3: User & Hotel Management**
  - Flyway migration `V3__hotel_and_amenity_schema.sql` (`amenities`, `hotels`, `hotel_amenities`)
  - Hotel onboarding workflow for `ROLE_HOTEL_MANAGER`
  - Strict ownership validation (cross-manager mutations rejected with 403 Forbidden)
  - Admin approval workflow (`PATCH /api/v1/admin/hotels/{id}/verify` restricted to `ROLE_ADMIN`)
  - Pre-seeded standard amenity catalog with mystery clue tags
  - Mockito unit tests and MockMvc integration tests (17/17 test suite passing)
  - Interactive property onboarding and admin verification panel in React frontend

- [x] **Phase 4: Room Inventory Engine**
  - Flyway migration `V4__room_inventory_schema.sql` (`room_types`, `room_inventories`)
  - Room category definitions and retail base pricing with `DECIMAL(10,2)`
  - Daily inventory calendar engine tracking `total_rooms`, `booked_rooms`, and `available_rooms`
  - Concurrency locking with `@Lock(LockModeType.PESSIMISTIC_WRITE)` preventing negative room availability
  - Multi-day stay date range availability and pricing calculator
  - Mockito unit tests and MockMvc integration tests (24/24 test suite passing)
  - Interactive room category and calendar seeding interface in React frontend

- [x] **Phase 5: Mystery Deals Engine**
  - Flyway migration `V5__mystery_deals_schema.sql` (`mystery_deals` table with constraints)
  - Discounted pricing engine with validation (deal price strictly lower than room retail rate)
  - Strict identity-masking pipeline: public deals completely mask hotel name, street address, contact info, and chain
  - Exposes only city, zone area, star rating, mystery clue tags, description clues, and amenity hints
  - Hotel manager portal for deal publication and lifecycle status toggle (`ACTIVE`, `EXPIRED`, `SOLD_OUT`, `CANCELLED`)
  - Mockito unit tests and MockMvc integration tests (29/29 test suite passing)
  - Interactive mystery deal discovery feed and manager deal creator in React frontend

- [ ] **Phase 6: DSA-Powered Search & Recommendations**
  - Min/Max Heap (PriorityQueue) Top-$K$ deal ranker
  - Inverted index for fast tag/amenity filtering
  - Sliding window for calendar price-drop detection

- [ ] **Phase 7: Booking Engine & Concurrency Control**
  - Multi-step transactional booking state machine
  - Concurrency stress tests preventing overbooking
  - Reservation auto-expiration timers

- [ ] **Phase 8: Payment Integration (Razorpay Sandbox)**
  - Order creation and client checkout
  - Webhook verification with HMAC-SHA256
  - Idempotency guarantees and post-payment hotel identity reveal

- [ ] **Phase 9: Full-Stack Frontend Experience**
  - Modern, responsive UI with Tailwind CSS
  - Mystery hotel reveal animation & countdown reservation timer
  - User and hotel manager portals

- [ ] **Phase 10: Testing, Optimization, Docker & CI/CD**
  - Testcontainers end-to-end suite
  - Performance profiling & Redis caching layer
  - GitHub Actions CI pipeline
