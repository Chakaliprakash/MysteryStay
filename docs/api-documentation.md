# MysteryStay — REST API Documentation

> **Project**: MysteryStay  
> **Tagline**: Discover Hidden Stays. Unlock Better Deals.  
> **Founder & Developer**: Prakash Chakali  
> **Base URL**: `http://localhost:8080/api/v1`  
> **Standard Response Format**: `{"success": boolean, "message": string, "data": object, "timestamp": string}`

---

## 1. Authentication & Security (`/api/v1/auth`)

### 1.1 User Registration
- **Endpoint**: `POST /auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "fullName": "Alex Morgan",
    "email": "traveler.alex@mysterystay.com",
    "password": "Password123!",
    "phone": "+919876543210",
    "role": "ROLE_CUSTOMER"
  }
  ```
- **Response**: `201 Created` with JWT access token, opaque refresh token, and user metadata.

### 1.2 User Login
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "traveler.alex@mysterystay.com",
    "password": "Password123!"
  }
  ```
- **Response**: `200 OK` with 15-minute JWT access token and 7-day refresh token.

### 1.3 Refresh Access Token
- **Endpoint**: `POST /auth/refresh`
- **Access**: Public (requires valid refresh token)

---

## 2. Hotels & Amenities (`/api/v1/hotels`, `/api/v1/admin/hotels`)

### 2.1 Onboard Hotel
- **Endpoint**: `POST /hotels`
- **Access**: `ROLE_HOTEL_MANAGER`, `ROLE_ADMIN`
- **Request Body**: Hotel details, star rating (1–5), GPS coordinates, street address, and contact info.
- **Initial Status**: `verified = false` until platform administrator approval.

### 2.2 List Managed Hotels
- **Endpoint**: `GET /hotels/my`
- **Access**: `ROLE_HOTEL_MANAGER`
- **Enforcement**: Strictly scoped to hotels owned by the authenticated manager.

### 2.3 Admin Hotel Verification Ledger
- **Endpoint**: `GET /admin/hotels`
- **Access**: `ROLE_ADMIN`

### 2.4 Verify or Suspend Hotel
- **Endpoint**: `PATCH /admin/hotels/{id}/verify?verified=true`
- **Access**: `ROLE_ADMIN`

---

## 3. Room Inventory Engine (`/api/v1/hotels/{id}/room-types`, `/api/v1/inventory`)

### 3.1 Create Room Type
- **Endpoint**: `POST /hotels/{hotelId}/room-types`
- **Access**: Hotel Owner or Admin
- **Categories**: `STANDARD_ROOM`, `DELUXE_ROOM`, `EXECUTIVE_SUITE`, `PRESIDENTIAL_SUITE`, `VILLA`, `PENTHOUSE`.

### 3.2 Seed Inventory Calendar
- **Endpoint**: `POST /inventory/hotels/{hotelId}/room-types/{roomTypeId}/seed`
- **Access**: Hotel Owner or Admin
- **Request Body**: Date range (`startDate`, `endDate`), `totalRooms`, optional custom `nightlyRate`.

### 3.3 Check Date Range Availability
- **Endpoint**: `GET /inventory/room-types/{roomTypeId}/availability?checkInDate=YYYY-MM-DD&checkOutDate=YYYY-MM-DD&roomCount=1`
- **Access**: Public / Authenticated

---

## 4. Mystery Deals Engine (`/api/v1/deals`)

### 4.1 Browse Active Mystery Deals
- **Endpoint**: `GET /deals`
- **Access**: Public
- **Identity Masking Enforcement**: Hotel name, exact street address, and phone coordinates are completely omitted. Only city, zone area, star rating, mystery clue tags, and description clues are returned.

### 4.2 Get Deal Details
- **Endpoint**: `GET /deals/{dealId}`
- **Access**: Public

### 4.3 Publish Mystery Deal
- **Endpoint**: `POST /deals`
- **Access**: Hotel Owner or Admin
- **Validation**: Discount rate must be strictly between 20% and 70%. Deal price must be strictly lower than retail rate.

---

## 5. DSA Search & Optimization (`/api/v1/search`)

### 5.1 Multi-Attribute Inverted Index Search
- **Endpoint**: `GET /search/deals`
- **Query Params**: `city`, `minRating`, `minDiscount`, `maxPrice`
- **Algorithm**: $O(\min(|S_1|, \dots, |S_m|))$ set intersection across HashSets in memory.

### 5.2 Sliding Window Consecutive Stay Optimizer
- **Endpoint**: `GET /search/deals/{dealId}/best-window?stayLength=3`
- **Algorithm**: $O(D)$ linear-time contiguous cheapest stay window detector with $O(1)$ space.

---

## 6. Bookings & Concurrency Engine (`/api/v1/bookings`)

### 6.1 Create Booking Hold
- **Endpoint**: `POST /bookings`
- **Access**: Authenticated (`ROLE_CUSTOMER`, etc.)
- **Concurrency Guard**: Acquires `@Lock(LockModeType.PESSIMISTIC_WRITE)` (`SELECT ... FOR UPDATE`) on daily room ledger.
- **State**: Initiates in `PENDING_PAYMENT` with a 15-minute expiration hold.
- **Identity State**: `identity_revealed = false`.

### 6.2 View My Bookings
- **Endpoint**: `GET /bookings/my`
- **Access**: Authenticated Traveler

### 6.3 Cancel Booking
- **Endpoint**: `POST /bookings/{id}/cancel`
- **Access**: Booking Owner or Admin
- **Restoration**: Atomically releases locked rooms back to available inventory.

---

## 7. Payments & Identity Reveal (`/api/v1/payments`)

### 7.1 Create Razorpay Sandbox Order
- **Endpoint**: `POST /payments/create-order`
- **Access**: Authenticated
- **Request Body**: `{"bookingId": 101}`
- **Response**: Razorpay Order ID (`order_...`), amount in cents/currency, and keyId.

### 7.2 Verify Payment & Reveal Hotel Identity
- **Endpoint**: `POST /payments/verify`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "razorpayOrderId": "order_testPay12345",
    "razorpayPaymentId": "pay_testPay67890",
    "razorpaySignature": "hmac_sha256_hash"
  }
  ```
- **Cryptographic Guard**: Constant-time `MessageDigest.isEqual` on HMAC-SHA256 signature.
- **Idempotency Guard**: Duplicate calls return existing success record without re-running transitions.
- **Cross-Module Hook**: Transitions booking to `CONFIRMED` and returns unmasked hotel name, street address, and VIP concierge phone!

### 7.3 Create UPI QR Payment Order
- **Endpoint**: `POST /payments/upi/create-order`
- **Access**: Authenticated
- **Request Body**: `{"bookingId": 101}`
- **Response**:
  ```json
  {
    "paymentReference": "PAY-UPI-1234-ABCD",
    "bookingId": 101,
    "bookingReference": "BK-MS-849201",
    "upiId": "6302714896@mbk",
    "payeeName": "MysteryStay Prive",
    "amountInInr": 12665.00,
    "currency": "INR",
    "originalAmount": 149.00,
    "originalCurrency": "USD",
    "upiUri": "upi://pay?pa=6302714896@mbk&pn=MysteryStay%20Prive&am=12665.00&cu=INR&tn=MysteryStay%20BK-MS-849201&tr=PAY-UPI-1234-ABCD",
    "status": "PENDING",
    "expiresAt": "2026-11-07T14:00:00Z",
    "expirySeconds": 900,
    "supportedApps": ["Google Pay", "PhonePe", "Paytm", "BHIM", "CRED UPI", "Any UPI App"]
  }
  ```

### 7.4 Verify UPI Payment & Reveal Hotel Identity
- **Endpoint**: `POST /payments/upi/verify`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "paymentReference": "PAY-UPI-1234-ABCD",
    "upiTransactionId": "UPI_UTR_412345678901",
    "remarks": "Paid via Google Pay"
  }
  ```
- **Server-Side Validation**:
  - Validates active payment session and 15-minute expiration countdown.
  - Idempotency guard prevents duplicate callbacks.
  - Marks payment `SUCCESS` and atomically unlocks confidential hotel identity.

### 7.5 Check UPI Payment Status
- **Endpoint**: `GET /payments/upi/status/{paymentReference}`
- **Access**: Authenticated
- **Response**: Latest payment order state (`PENDING`, `SUCCESS`, `FAILED`, `EXPIRED`).

### 7.6 Razorpay Webhook
- **Endpoint**: `POST /payments/webhook`
- **Access**: Public (guarded by webhook secret header)
- **Events**: Handles `payment.captured` and `payment.failed`.

---

## 8. Platform Health
- **Endpoint**: `GET /health`
- **Response**: `{"status": "UP", "service": "MysteryStay Monolith", "database": "UP"}`
