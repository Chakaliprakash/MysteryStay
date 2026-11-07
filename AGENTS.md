# MYSTERYSTAY – PROJECT ENGINEERING RULES

## 1. Project Identity

Project name: MysteryStay

Purpose: Build an intelligent mystery hotel booking platform that helps hotels monetize unsold room inventory through discounted, identity-masked hotel deals.

This is my flagship resume project. Treat it as a serious, production-oriented software engineering project, not a basic college CRUD application.

## 2. Technology Stack

Backend:
- Java 21
- Spring Boot 3.x
- Maven
- Spring Security
- JWT authentication
- Spring Data JPA
- Hibernate
- MySQL 8.4
- Flyway database migrations
- Redis
- REST APIs

Frontend:
- React
- JavaScript
- Vite
- Tailwind CSS
- Axios
- React Router

Testing:
- JUnit 5
- Mockito
- Spring Boot Test
- Testcontainers

Infrastructure:
- Docker
- Docker Compose
- Git
- GitHub Actions

Payments:
- Razorpay test mode or another supported payment sandbox.
- Never use real payment credentials in development.

## 3. Architecture

Use a modular monolith.

Keep the backend in one Spring Boot deployable application.

Create separate business modules:
- auth
- user
- hotel
- inventory
- deal
- search
- booking
- payment
- recommendation
- analytics
- admin
- common
- security
- config

Each module should own its business logic and persistence layer.

Do not directly access another module's repositories.

Use service interfaces or explicit module APIs for cross-module communication.

Avoid unnecessary microservices and premature abstraction.

## 4. Coding Standards

- Follow Java naming conventions.
- Use meaningful class and method names.
- Apply SOLID principles where useful.
- Keep controllers thin.
- Put business logic in service classes.
- Use DTOs for API input and output.
- Validate incoming requests.
- Use global exception handling.
- Avoid exposing JPA entities directly through APIs.
- Use constructor injection.
- Avoid unnecessary Lombok.
- Never write giant service classes.
- Add comments only when they clarify non-obvious logic.
- Keep code readable and maintainable.

## 5. Database Rules

- Use MySQL.
- Use Flyway for every schema change.
- Do not use Hibernate ddl-auto=create or update.
- Use ddl-auto=validate.
- Add proper foreign keys and unique constraints.
- Add indexes for frequently queried columns.
- Use transactions for booking and payment workflows.
- Use appropriate locking to prevent double booking.
- Store monetary values using BigDecimal and DECIMAL columns.
- Store timestamps consistently.

## 6. Security Rules

- Never store plain-text passwords.
- Use BCrypt or an appropriate Spring Security password encoder.
- Implement role-based access control.
- Validate ownership of hotel and booking resources.
- Do not expose hotel identities before confirmed bookings.
- Never hardcode secrets.
- Keep .env files out of Git.
- Validate all payment callbacks and signatures.
- Never trust frontend authorization alone.

## 7. DSA Integration

DSA must solve actual application problems.

Implement and explain:
- Sorting algorithms
- HashMap and HashSet
- PriorityQueue and Heap
- Sliding Window
- Greedy Algorithms
- Dynamic Programming
- Graph Algorithms

For relevant algorithms, document:
- Problem statement
- Brute force solution
- Better solution
- Optimal solution
- Java Streams alternative where applicable
- Dynamic Programming alternative where mathematically appropriate
- Dry run
- Time complexity
- Space complexity
- Benchmark results

Do not force an inappropriate algorithm into a business workflow.

## 8. Testing Requirements

- Write unit tests for business logic.
- Write integration tests for API and database behavior.
- Test authentication and authorization.
- Test invalid inputs and error scenarios.
- Test booking concurrency.
- Test payment failure and duplicate callbacks.
- Never claim a feature works without verification.
- Run the relevant tests after every milestone.

## 9. Development Workflow

For every milestone:

1. Inspect existing project files.
2. Understand the current architecture.
3. Create an implementation plan.
4. Explain affected files.
5. Implement only the approved scope.
6. Run tests.
7. Fix failures.
8. Review security and maintainability.
9. Update documentation.
10. Report what was completed and what remains.

Never overwrite working code without inspecting it.

Never delete files without explaining why.

Do not invent test results.

Do not leave placeholder implementations while reporting a feature as complete.

## 10. Documentation

Maintain:
- README.md
- docs/architecture.md
- docs/database-design.md
- docs/api-documentation.md
- docs/dsa-implementations.md
- docs/development-roadmap.md

Keep documentation synchronized with actual implementation.

## 11. Current Development Priority

Follow this order:

Phase 1: Foundation and environment setup.
Phase 2: Authentication and authorization.
Phase 3: User and hotel management.
Phase 4: Room inventory.
Phase 5: Mystery deals.
Phase 6: DSA-powered search and recommendations.
Phase 7: Booking engine.
Phase 8: Payment integration.
Phase 9: Frontend completion.
Phase 10: Testing, optimization, Docker and deployment.

Do not start future phases without completing and verifying the current phase.

## 12. Developer Education

I am building this project to become a strong Java full-stack developer.

Explain important architectural decisions and trade-offs.

When implementing complex code, explain:
- What the code does.
- Why the approach is used.
- How the components communicate.
- What alternatives exist.
- What an interviewer might ask.

Do not sacrifice code quality to generate code quickly.

Build MysteryStay incrementally as a professional software engineer would.