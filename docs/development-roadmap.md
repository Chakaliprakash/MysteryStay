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

- [x] **Phase 6: DSA-Powered Search & Recommendations**
  - Top-$K$ Mystery Deal Ranker via Bounded Min-Heap (`PriorityQueue`): $O(N \log K)$ time and $O(K)$ space with dynamic multi-factor value scoring
  - Multi-Attribute Inverted Index (`HashMap` + `HashSet`): $O(\min(|S_1|, \dots, |S_m|))$ sub-millisecond set intersection filtering on city, star rating, and luxury amenity clues
  - Consecutive Stay Calendar Price Optimizer via Sliding Window: $O(D)$ linear-time cheapest stay window detector with $O(1)$ space
  - Formal DSA architectural & interview documentation in `docs/dsa-implementations.md`
  - Automated tests (43/43 total project tests passing)
  - Interactive DSA Search & Stay Optimizer explorer in React frontend with live algorithmic metrics

- [x] **Phase 7: Booking Engine & Concurrency Control**
  - Flyway migration `V6__booking_schema.sql` (`bookings` table with state machine & indexes)
  - Multi-step transactional booking state machine (`PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED`, `EXPIRED`)
  - Concurrency locking with `@Lock(LockModeType.PESSIMISTIC_WRITE)` (`SELECT ... FOR UPDATE`) preventing double-booking
  - 15-minute reservation expiration hold timers with background sweeper (`BookingExpirationWorker`)
  - Identity reveal pipeline: hotel name, street address, and direct phone revealed strictly upon payment confirmation
  - Multithreaded concurrency stress tests (10 simultaneous threads competing for 1 room $\to$ exactly 1 succeeds, 9 receive 409 Conflict)
  - Automated tests (49/49 total project tests passing)
  - Interactive Apple & Big-Tech inspired UI with glassmorphic cards, native modal checkout, and secret identity unlock celebration

- [x] **Phase 8: Payment Integration (Razorpay Sandbox)**
  - Flyway migration `V7__payment_schema.sql` (`payments` table with constraints & indexes)
  - Razorpay sandbox order creation with currency & amount validation (`order_` + 14 chars)
  - Cryptographic verification via HMAC-SHA256 signature calculation using `HexFormat` & timing-resistant comparison (`MessageDigest.isEqual`)
  - Strict idempotency guards: duplicate client verifications or webhook events return idempotent success without duplicate processing
  - Webhook processing for asynchronous payment events (`payment.captured`, `payment.failed`)
  - Cross-module transactional hook: transitions booking to `CONFIRMED` and unlocks full hotel identity
  - Comprehensive unit and integration test coverage (`PaymentServiceTest`, `PaymentControllerTest`, 58/58 total project tests passing)

- [x] **Phase 9: Full-Stack Frontend Experience**
  - High-end bespoke luxury design system: Deep Midnight Navy (`#14251F`), Warm Ivory (`#F8F6F0`), and Champagne Gold (`#C6A66B`)
  - Sophisticated editorial typography pairing: `DM Serif Display` / `Playfair Display` with `Plus Jakarta Sans` / `Inter`
  - 15-section Landing Page with destination photography, interactive category bar, and savings comparison calculator
  - Advanced Inverted Index Search & Discovery page with multi-filter sidebar, sorting, and grid/list view toggles
  - Mystery Deal Detail dossier with architectural clues, luxury amenity inclusion chips, and sticky booking bar
  - Multistep checkout flow with 15-minute countdown hold timer, Razorpay sandbox integration, and celebratory unmasked identity reveal certificate
  - Full-featured Customer Trips dashboard with cancellation support and booking vouchers
  - Hotel Partner Studio with Recharts revenue & occupancy analytics, property ledger, and mystery deal publisher
  - Platform Admin Governance Console with live hotel verification and suspension ledger
  - Dedicated interactive DSA Laboratory visualizer demonstrating Java algorithms (Top-K Min-Heap, Sliding Window, Inverted Index, 0/1 Knapsack)
  - Modular feature-based React architecture (`src/features/`, `src/components/`, `src/services/`, `src/context/`) with zero build errors

- [ ] **Phase 10: Testing, Optimization, Docker & CI/CD**
  - Testcontainers end-to-end suite
  - Performance profiling & Redis caching layer
  - GitHub Actions CI pipeline
