# Finova - Personal Banking & Transaction Management System

A full-stack web application simulating a modern banking system with 3D elements, transaction management, transfers, loans, and financial insights.

## Tech Stack

**Frontend:** React.js, Three.js, @react-three/fiber, @react-three/drei, react-parallax-tilt, Recharts  
**Backend:** Node.js, Express.js  
**Database:** MongoDB with Mongoose

## Features

### Authentication
- JWT-based login/registration with bcrypt password hashing
- Session timeout handling
- Protected routes

### Dashboard
- **3D Interactive Balance Card** with tilt effect
- Monthly overview bar chart
- Spending by category pie chart
- Recent transactions

### Transactions
- **3D Animated Icons** for incoming/outgoing
- Filter by type and category
- Sort by date or amount
- Pagination

### Transfers
- Send money to other users by email
- Instant transfers with notifications

### Loan System
- Request loans
- Admin approval workflow
- Repay loans with partial payments

### Admin Panel
- View all users
- Approve/reject loan requests
- View all transactions

### 3D Elements
- Animated 3D scene on login page
- Floating cube with distortion material
- Rotating torus ring
- Orbiting spheres
- Card tilt effect on dashboard

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)

### Installation

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Configuration

Create `server/.env` with:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/bankapp
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h
```

### Running the Application

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm start
```

### Seed Database (optional)

```bash
cd server
npm run seed
```

This creates 15 users with transactions and an admin account:
- Admin: `admin@finova.com` / `ad
min123`
- Users: `sarah@finova.com` through `matthew@finova.com` (password: `user123`)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users (admin only)

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create transaction
- `POST /api/transactions/transfer` - Transfer funds
- `POST /api/transactions/loan/request` - Request loan
- `POST /api/transactions/loan/repay` - Repay loan
- `POST /api/transactions/loan/approve/:userId` - Approve loan (admin)
- `GET /api/transactions/stats` - Get dashboard stats
- `GET /api/transactions/all` - Get all transactions (admin)

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

## License

MIT
