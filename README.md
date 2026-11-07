# MysteryStay — Intelligent Mystery Hotel Booking Platform

[![Java 21](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.4%20%2F%209.x-blue.svg)](https://www.mysql.com/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

> An intelligent, high-performance mystery hotel booking platform that enables hotels to monetize unsold room inventory through discounted, identity-masked deals. Hotel names remain confidential until booking confirmation.

---

## Architecture Overview

MysteryStay is built as a **Modular Monolith** with clear bounded contexts:

- `auth`: JWT authentication, token rotation, and BCrypt encryption.
- `hotel`: Hotel onboarding, verification, and private inventory configurations.
- `inventory`: Daily room availability, capacity management, and optimistic locking.
- `deal`: Masked deal generation, discount pricing models, and clue generation.
- `search`: DSA-powered search engine using a PriorityQueue Top-$K$ ranking algorithm.
- `booking`: Transactional state engine with database row locking (`PESSIMISTIC_WRITE`) to prevent double-booking.
- `payment`: Razorpay sandbox payment gateway with HMAC webhook verification and idempotency keys.
- `analytics`: Occupancy analytics, deal velocity, and audit logs.

For detailed architecture decisions, see [`docs/architecture.md`](docs/architecture.md).

---

## Tech Stack

- **Backend**: Java 21, Spring Boot 3.3.5, Spring Security, Spring Data JPA, Hibernate (validate mode), Flyway, MySQL 8.4/9.x, Redis.
- **Frontend**: React, Vite, Tailwind CSS, Axios, Lucide React, React Router.
- **Testing**: JUnit 5, Mockito, Spring Boot Test, Testcontainers.
- **DevOps**: Docker, Docker Compose, Git.

---

## Quick Start (Local Development)

### Prerequisites
- JDK 21
- Apache Maven 3.9+
- Node.js 20+ & npm
- MySQL 8.4+

### 1. Backend Setup
```bash
cd backend
mvn clean test
mvn spring-boot:run
```
Backend starts on `http://localhost:8080`. Health check available at `http://localhost:8080/api/v1/health`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend starts on `http://localhost:5173`.

### 3. Docker Compose (Full Stack)
```bash
cd docker
docker compose up -d
```

---

## Founder & Engineering Leadership

### **Prakash Chakali — Founder & Developer**
> *"Discover Hidden Stays. Unlock Better Deals."*

I am a passionate Java developer focused on building scalable, user-friendly applications using Java, Spring Boot, React, and MySQL. I enjoy solving real-world problems through technology, exploring data structures and algorithms, and designing modern software experiences.

MysteryStay reflects my interest in combining innovative ideas with practical technology to make travel more affordable and accessible.

