# Finova Banking System - Complete API Documentation

## Overview
Finova is a full-stack banking application with user authentication, transaction management, transfer capabilities, and an advanced loan system. All data is persisted in MongoDB.

---

## Database Schemas

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  balance: Number (default: 5000),
  role: String ('user' | 'admin'),
  phoneNumber: String,
  accountType: String ('savings' | 'checking' | 'business'),
  verified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String ('credit' | 'debit' | 'transfer' | 'loan'),
  amount: Number,
  description: String,
  category: String ('food' | 'travel' | 'bills' | 'transfer' | 'loan' | 'salary' | 'shopping' | 'other'),
  fromUserId: ObjectId (ref: User),
  toUserId: ObjectId (ref: User),
  status: String ('completed' | 'pending' | 'failed'),
  createdAt: Date
}
```

### Loan Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  amount: Number,
  remainingAmount: Number,
  purpose: String ('personal' | 'business' | 'education' | 'home' | 'vehicle' | 'medical' | 'other'),
  duration: Number (months, 1-360),
  monthlyIncome: Number,
  employmentStatus: String ('employed' | 'self-employed' | 'unemployed' | 'student' | 'retired' | 'other'),
  reason: String,
  status: String ('pending' | 'approved' | 'rejected' | 'completed'),
  approvedBy: ObjectId (ref: User),
  rejectionReason: String,
  createdAt: Date,
  approvedAt: Date,
  completedAt: Date
}
```

### Notification Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String ('transfer' | 'loan' | 'payment' | 'alert'),
  title: String,
  message: String,
  read: Boolean (default: false),
  createdAt: Date
}
```

---

## API Endpoints

### Authentication Endpoints

#### Register New User
```
POST /api/auth/register
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "balance": 5000,
    "role": "user"
  }
}
```

#### Login
```
POST /api/auth/login
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "balance": 5000,
    "role": "user"
  }
}
```
**Note:** Creates a login notification automatically.

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}
```
**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "balance": 5000,
  "role": "user",
  "accountType": "checking",
  "verified": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### Transaction Endpoints

#### Get User Transactions
```
GET /api/transactions?page=1&limit=20&category=transfer&type=transfer&sortBy=createdAt&order=desc
Authorization: Bearer {token}
```
**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `category` (optional: food, travel, bills, transfer, loan, salary, shopping, other)
- `type` (optional: credit, debit, transfer, loan)
- `sortBy` (default: createdAt)
- `order` (asc | desc, default: desc)

**Response (200):**
```json
{
  "transactions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439011",
      "type": "transfer",
      "amount": 100,
      "description": "Payment for John",
      "category": "transfer",
      "toUserId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John"
      },
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "pages": 3
}
```

#### Create Transaction (Credit/Debit)
```
POST /api/transactions
Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "type": "credit",
  "amount": 500,
  "description": "Salary deposit",
  "category": "salary"
}
```
**Response (201):**
```json
{
  "transaction": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439011",
    "type": "credit",
    "amount": 500,
    "description": "Salary deposit",
    "category": "salary",
    "status": "completed",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "balance": 5500
}
```

#### Transfer Money
```
POST /api/transactions/transfer
Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "toEmail": "recipient@example.com",
  "amount": 250,
  "description": "Monthly payment"
}
```
**Response (200):**
```json
{
  "message": "Transfer successful.",
  "transaction": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "transfer",
    "amount": 250,
    "category": "transfer",
    "status": "completed"
  },
  "balance": 4750
}
```
**Creates Notifications:**
- For sender: "Transfer Successful"
- For recipient: "Transfer Received"

**Error Cases:**
- 400: "Insufficient balance"
- 400: "Cannot transfer to yourself"
- 404: "Recipient not found"

#### Get Dashboard Stats
```
GET /api/transactions/stats
Authorization: Bearer {token}
```
**Response (200):**
```json
{
  "balance": 5000,
  "monthlyTransactions": [
    {
      "_id": "transfer",
      "total": 500,
      "count": 2
    },
    {
      "_id": "credit",
      "total": 1000,
      "count": 1
    }
  ],
  "categoryStats": [
    {
      "_id": "transfer",
      "total": 500
    },
    {
      "_id": "salary",
      "total": 1000
    }
  ],
  "recentTransactions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "transfer",
      "amount": 250,
      "description": "Payment",
      "category": "transfer",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "activeLoan": null,
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "accountType": "checking"
  }
}
```

#### Get All Transactions (Admin)
```
GET /api/transactions/all?page=1&limit=50
Authorization: Bearer {token}
```
**Response (200):**
```json
{
  "transactions": [...],
  "total": 150,
  "page": 1,
  "pages": 3
}
```

---

### Loan Endpoints

#### Request Loan
```
POST /api/transactions/loan/request
Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "amount": 5000,
  "purpose": "education",
  "duration": 24,
  "monthlyIncome": 3000,
  "employmentStatus": "employed",
  "reason": "Need funds for my college education at State University"
}
```
**Response (201):**
```json
{
  "message": "Loan request submitted successfully.",
  "loan": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439011",
    "amount": 5000,
    "remainingAmount": 5000,
    "purpose": "education",
    "duration": 24,
    "monthlyIncome": 3000,
    "employmentStatus": "employed",
    "reason": "Need funds for my college education",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```
**Creates Notification:** "Loan Request Submitted"

**Validation:**
- Minimum amount: $100
- Duration: 1-360 months
- Reason: minimum 10 characters
- Can only have one active/pending loan

#### Repay Loan
```
POST /api/transactions/loan/repay
Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "amount": 500
}
```
**Response (200):**
```json
{
  "message": "Loan repayment successful.",
  "transaction": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "debit",
    "amount": 500,
    "description": "Loan repayment: $500",
    "category": "loan",
    "status": "completed"
  },
  "balance": 4500,
  "remainingLoan": 4500,
  "loanStatus": "approved"
}
```
**Creates Notification:** "Loan Repayment"

---

### Admin Endpoints

#### Get Dashboard Stats
```
GET /api/admin/stats
Authorization: Bearer {token}
```
**Response (200):**
```json
{
  "totalUsers": 42,
  "totalTransactions": 256,
  "loanStats": {
    "pending": 3,
    "approved": 8,
    "rejected": 2,
    "completed": 5
  },
  "totalLoanAmount": 50000,
  "totalDisbursed": 40000,
  "recentUsers": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "balance": 2500,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Get All Users
```
GET /api/admin/users?page=1&limit=50&search=john
Authorization: Bearer {token}
```
**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)
- `search` (optional: searches name and email)

**Response (200):**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "balance": 5000,
      "role": "user",
      "accountType": "checking",
      "verified": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pages": 1
}
```

#### Get All Loans
```
GET /api/admin/loans?page=1&limit=50&status=pending
Authorization: Bearer {token}
```
**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)
- `status` (all | pending | approved | rejected | completed)

**Response (200):**
```json
{
  "loans": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "123-456-7890"
      },
      "amount": 5000,
      "remainingAmount": 5000,
      "purpose": "education",
      "duration": 24,
      "monthlyIncome": 3000,
      "employmentStatus": "employed",
      "reason": "College education",
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 5,
  "stats": {
    "pending": 3,
    "approved": 1,
    "rejected": 1,
    "completed": 0
  },
  "page": 1,
  "pages": 1
}
```

#### Get Loan Details
```
GET /api/admin/loans/{loanId}
Authorization: Bearer {token}
```
**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "123-456-7890",
    "balance": 5000
  },
  "amount": 5000,
  "remainingAmount": 5000,
  "purpose": "education",
  "duration": 24,
  "monthlyIncome": 3000,
  "employmentStatus": "employed",
  "reason": "College education",
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Approve Loan
```
POST /api/admin/loans/{loanId}/approve
Authorization: Bearer {token}
```
**Response (200):**
```json
{
  "message": "Loan approved successfully.",
  "loan": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "approved",
    "approvedBy": "507f1f77bcf86cd799439000",
    "approvedAt": "2024-01-15T11:00:00Z"
  },
  "transaction": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "loan",
    "amount": 5000,
    "description": "Loan approved: $5000",
    "status": "completed"
  }
}
```
**Actions Performed:**
1. Creates loan disbursement transaction
2. Adds loan amount to user's balance
3. Creates notification for user
4. Updates loan status to "approved"

#### Reject Loan
```
POST /api/admin/loans/{loanId}/reject
Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "reason": "Income is insufficient for the requested amount"
}
```
**Response (200):**
```json
{
  "message": "Loan rejected successfully.",
  "loan": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "rejected",
    "rejectionReason": "Income is insufficient for the requested amount",
    "approvedAt": "2024-01-15T11:00:00Z"
  }
}
```
**Creates Notification:** Includes rejection reason

---

### Notification Endpoints

#### Get Notifications
```
GET /api/notifications?page=1&limit=50&unreadOnly=false
Authorization: Bearer {token}
```
**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)
- `unreadOnly` (default: false)

**Response (200):**
```json
{
  "notifications": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439011",
      "type": "transfer",
      "title": "Transfer Received",
      "message": "You received $100 from John Doe.",
      "read": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 15,
  "unreadCount": 3
}
```

#### Mark Notification as Read
```
PUT /api/notifications/{notificationId}/read
Authorization: Bearer {token}
```
**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "read": true
}
```

#### Mark All Notifications as Read
```
PUT /api/notifications/read-all
Authorization: Bearer {token}
```
**Response (200):**
```json
{
  "message": "All notifications marked as read."
}
```

---

## Error Handling

### Standard Error Responses

**400 Bad Request:**
```json
{
  "message": "Invalid request parameters"
}
```

**401 Unauthorized:**
```json
{
  "message": "Access denied. No token provided."
}
```

**403 Forbidden:**
```json
{
  "message": "Admin access required."
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found."
}
```

**500 Internal Server Error:**
```json
{
  "message": "Server error. Please try again later."
}
```

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer {token}
```

Token is obtained from login/register and is stored in `localStorage`.

---

## Common Workflows

### Complete Transfer Flow
1. User clicks "Transfer Money"
2. User enters recipient email, amount, and description
3. Frontend validates and calls `POST /api/transactions/transfer`
4. Backend:
   - Validates insufficient balance
   - Creates debit transaction for sender
   - Creates credit transaction for recipient
   - Updates both user balances
   - Creates notifications
5. Frontend updates user balance immediately
6. Both users see transactions in their history

### Complete Loan Flow
1. User clicks "Request Loan"
2. User fills comprehensive form (amount, purpose, income, reason, etc.)
3. Frontend calls `POST /api/transactions/loan/request`
4. Backend creates loan with status "pending"
5. Admin views loan in Admin Panel → Loan Requests
6. Admin reviews loan details and approves/rejects
7. If approved:
   - Loan amount is disbursed to user
   - User balance increases
   - Notification sent to user
8. User can view active loan in Loan Management page
9. User can repay loan partially or fully
10. When fully repaid, loan status changes to "completed"

### Real-Time Updates
- Dashboard stats update after each transaction
- User balance updates immediately
- Recent transactions refresh
- Notifications appear immediately
- Admin panel shows latest activity

---

## Testing the System

### Setup
1. Create admin account in seed.js
2. Create regular user accounts
3. Start backend: `npm run dev`
4. Start frontend: `npm start`

### Test Admin Loan Approval
1. Register as regular user
2. Request a loan
3. Login as admin
4. Navigate to Admin Panel → Loan Requests
5. Click "View Details" on pending loan
6. Click "Approve" or enter rejection reason and click "Reject"
7. Switch back to regular user
8. Check notifications for approval/rejection
9. If approved, check updated balance and loan page

### Test Transfers
1. Register two users
2. User 1: Transfer $100 to User 2's email
3. User 1: Check updated balance and transaction history
4. User 2: Check received transfer and notifications
5. Both: Verify transaction appears in their history

---

## Environment Variables

Create `.env` in server directory:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/bankapp
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h
```

Create `.env.local` in client directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Seed Data

Run `npm run seed` in server directory to populate:
- Admin user: admin@finova.com / admin123
- 15 regular users: sarah@finova.com - matthew@finova.com / user123
- Sample transactions and loans

---

## Key Features Implemented

✅ JWT-based authentication with hashing
✅ User registration and login with validation
✅ Real-time balance updates
✅ Money transfer between users
✅ Comprehensive loan system with admin approval
✅ Partial loan repayment
✅ Transaction history with filtering and pagination
✅ Dashboard statistics and charts
✅ Automatic notifications for all actions
✅ Admin panel with user and loan management
✅ Full data persistence in MongoDB
✅ Error handling and validation throughout
✅ 3D UI elements and animations

