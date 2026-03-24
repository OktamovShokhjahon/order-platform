# Online Food Ordering Platform

A modern online food ordering platform with a Next.js frontend, Express.js backend, and Telegram bot integration.

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, TailwindCSS v4, Redux Toolkit, Framer Motion, next-intl
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Swagger
- **Telegram Bot**: node-telegram-bot-api

## Features

- Multi-language support (English, Russian, Uzbek)
- Dark/Light theme toggle
- Responsive design (mobile, tablet, desktop)
- Smooth animations with Framer Motion
- Full admin panel with dashboard analytics
- Mock payment system
- Telegram bot with WebApp integration

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd backend
npm install
```

Edit `backend/.env` with your MongoDB URI:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/food-ordering
JWT_SECRET=your_secret_key
```

Seed the database with sample data:

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

API docs available at: http://localhost:5000/api-docs

**Default accounts after seeding:**
- Admin: username `admin` / password `admin123`
- User: email `user@foodorder.com` / password `user123`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### 3. Telegram Bot

```bash
cd telegram-bot
npm install
```

Edit `telegram-bot/.env`:

```
BOT_TOKEN=your_telegram_bot_token
API_URL=http://localhost:5000/api
WEBAPP_URL=http://localhost:3000
ADMIN_CHAT_ID=your_admin_chat_id
```

```bash
npm start
```

## Project Structure

```
order-platform/
  backend/            Express.js REST API
    src/
      config/         DB, Swagger, upload config
      controllers/    Business logic
      middleware/      Auth, admin middleware
      models/         Mongoose schemas
      routes/         API endpoints
      seed.js         Database seeder
    server.js         Entry point
  frontend/           Next.js application
    src/
      app/[locale]/   Locale-based routing
        admin/        Admin panel pages
        categories/   Categories page
        food/[id]/    Food details page
        cart/         Shopping cart
        checkout/     Checkout flow
        order-success/ Order confirmation
        auth/         Login/Register
      components/     Reusable UI components
      store/          Redux Toolkit store
      lib/            API client
      i18n/           Internationalization config
    messages/         Translation files (en, ru, uz)
  telegram-bot/       Telegram bot
    src/
      bot.js          Entry point
      handlers/       Command & callback handlers
      services/       API service layer
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/categories | List categories |
| GET | /api/foods | List foods (with filters) |
| GET | /api/foods/:id | Food details |
| POST | /api/orders | Create order |
| GET | /api/orders | List orders |
| PUT | /api/orders/:id/status | Update order status |
| POST | /api/payments | Process payment |
| GET | /api/admin/dashboard | Admin statistics |
| GET | /api/admin/users | List users |
# order-pizza
