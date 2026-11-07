# MysteryStay — Development Roadmap

## Phase Tracker

- [x] **Phase 1: Foundation and Environment Setup**
  - Modular monolith project layout (`backend/`, `frontend/`, `docker/`, `docs/`)
  - Spring Boot 3.3.5, Java 21, Maven 3.10 setup
  - Local MySQL connection and Flyway migration V1
  - Automated smoke & health tests (`mvn test`)
  - React + Vite + Tailwind CSS frontend scaffold with health ping UI
  - Multi-stage Docker configuration

- [ ] **Phase 2: Authentication & Authorization**
  - User registration, BCrypt password hashing
  - JWT token generation, verification, and rotation
  - Spring Security Filter Chain & RBAC (`CUSTOMER`, `HOTEL_MANAGER`, `ADMIN`)

- [ ] **Phase 3: User & Hotel Management**
  - Hotel onboarding and manager ownership validation
  - Admin hotel approval workflow
  - Hotel metadata and amenity catalog

- [ ] **Phase 4: Room Inventory Engine**
  - Room category definitions
  - Daily inventory calendar
  - Pessimistic locking queries for atomic reservation

- [ ] **Phase 5: Mystery Deals Engine**
  - Discounted pricing engine
  - Strict identity-masking pipeline (clue generation, zone mapping)
  - Masked DTO serialization guarantees

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
