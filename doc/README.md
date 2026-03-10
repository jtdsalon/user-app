# Salon Booking App — User Application Documentation

This repository contains the frontend and relevant documentation for the customer-facing user app of the Salon Booking system.

---

## Overview

The User App allows customers to:

- Browse salons, services, and products
- Make bookings and manage appointments
- Track orders and payments
- Access loyalty programs, promo codes, and gift cards
- View reviews and ratings
- Receive notifications and reminders

### Technology Stack

- Frontend: React + Vite (React Router v6, Redux, MUI)
- Backend: Node.js + Express (API integration)
- Database: PostgreSQL / MongoDB (via backend API)
- Integrations: Stripe, WhatsApp, Email, Instagram

---

## Features — Customer-Facing

### Account & Authentication
- Signup / Sign-in via email, phone + OTP, or social login
- Profile management

### Booking & Services
- Browse salons, services, and prices
- Real-time booking calendar
- Book, reschedule, or cancel appointments
- Select staff or “any available” option
- Multi-branch support

### Products & Orders
- Browse product catalog
- One-click purchase / guest checkout
- Order tracking and history

### Loyalty & Promotions
- Loyalty points and discounts
- Promo codes and gift cards

### Reviews & Social
- Leave ratings and reviews for services & staff
- View salon social feed / Instagram integration
- Save favorites / wishlist

### Notifications
- Push notifications, email, and WhatsApp reminders

---

## Folder Structure

```
user-app/
├── doc/                         # Documentation
├── src/
│   ├── components/              # Feature-based components (Salons, Products, Chat, etc.)
│   ├── routes/                  # React Router v6 route definitions
│   ├── state/                   # Redux + Saga
│   ├── services/                # API layer
│   ├── assets/                  # Images, fonts, icons
│   └── App.tsx, main.tsx        # App entry
├── public/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Setup Instructions

1. Install dependencies

```bash
npm install
```

2. Configure environment variables (Vite)

Create .env.development:

```env
VITE_API_URL=http://localhost:5000/api
VITE_DEFAULT_LOCALE=en
VITE_DEFAULT_CURRENCY=USD
```

3. Start the development server

```bash
npm run dev
```

---

## Navigation & Routing

Uses React Router v6 with route-based navigation.

Main routes:

- /                       Home
- /dashboard              Dashboard
- /collection             Products
- /consultant             AI Consultant
- /chat                   Chat
- /chat/:conversationId   Chat (conversation)
- /archive                Feed / Archive
- /journals               Appointments / Journals

Browser back/forward supported. Direct URL access supported.

---

## Contributing

- Follow feature branch workflow
- Write unit tests for new pages/components
- Maintain consistent code style (ESLint + Prettier)

---

## License

This project is licensed under the MIT License.