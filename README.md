# Book My Flix

A full-stack movie theater booking system. Users can browse movies, check theater availability, select seats across different categories, and complete bookings with dynamic pricing.

## Tech Stack

### Backend

- **Framework**: NestJS (TypeScript) on Node.js 22
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (seat locking with TTL)
- **Auth**: JWT + bcrypt + Google SSO
- **Testing**: Vitest

### Frontend

- **Framework**: Next.js 16 (App Router, TypeScript)
- **UI**: Tailwind CSS v4 + shadcn/ui (Nova preset)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State**: React Query (@tanstack/react-query)
- **HTTP Client**: Axios
- **Auth**: Google Sign-In (@react-oauth/google)
- **Theme**: next-themes (dark/light mode)

### Infrastructure

- **Containerization**: Docker Compose (4 services)

## Features

- JWT authentication with role-based access control (REGULAR / ADMIN)
- Multi-theater support with multiple screens per theater
- Configurable seat layouts with categories (SILVER, GOLD, RECLINER)
- Dynamic pricing based on seat category, time slot (MORNING / EVENING), and day type (WEEKDAY / WEEKEND)
- Seat locking via Redis with 10-minute auto-expiry
- Show scheduling with overlap detection (15-minute buffer)
- Booking lifecycle: Lock → Confirm → Cancel
- Double-booking prevention via unique constraints

## Getting Started

### Prerequisites

- Docker & Docker Compose

### Running the Application

```bash
docker compose up --build
```

This starts four services:

| Service    | Port | Description          |
| ---------- | ---- | -------------------- |
| Frontend   | 3000 | Next.js dev server   |
| Backend    | 3333 | NestJS API server    |
| PostgreSQL | 5433 | Database             |
| Redis      | 6379 | Seat locking / cache |

On startup the backend automatically generates the Prisma client, runs migrations, and starts the dev server with hot reload.

### Environment Variables

Create a `.env` file in the project root:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=book_my_flix
DATABASE_URL=postgresql://postgres:postgres@db:5432/book_my_flix

JWT_SECRET=bookmyflix-secret-key-change-in-production

REDIS_HOST=redis
REDIS_PORT=6379

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Create `fe/.env.local` for the frontend:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:3333
```

## API Endpoints

Base URL: `http://localhost:3333`

### Auth

| Method | Endpoint       | Auth | Description               |
| ------ | -------------- | ---- | ------------------------- |
| POST   | `/auth/signup` | —    | Register user             |
| POST   | `/auth/login`  | —    | Login user                |
| POST   | `/auth/google` | —    | Login/register via Google |

All return `{ access_token }`.

### Movies

| Method | Endpoint      | Auth  | Description                            |
| ------ | ------------- | ----- | -------------------------------------- |
| GET    | `/movies`     | —     | List movies (filter: `title`, `genre`) |
| GET    | `/movies/:id` | —     | Get movie by ID                        |
| POST   | `/movies`     | Admin | Create movie                           |
| PUT    | `/movies/:id` | Admin | Update movie                           |
| DELETE | `/movies/:id` | Admin | Delete movie                           |

### Theaters

| Method | Endpoint        | Auth  | Description                    |
| ------ | --------------- | ----- | ------------------------------ |
| GET    | `/theaters`     | —     | List theaters (filter: `city`) |
| GET    | `/theaters/:id` | —     | Get theater by ID              |
| POST   | `/theaters`     | Admin | Create theater                 |
| PATCH  | `/theaters/:id` | Admin | Update theater                 |
| DELETE | `/theaters/:id` | Admin | Delete theater                 |

### Screens

| Method | Endpoint       | Auth  | Description                        |
| ------ | -------------- | ----- | ---------------------------------- |
| GET    | `/screens`     | —     | List screens (filter: `theaterId`) |
| GET    | `/screens/:id` | —     | Get screen by ID                   |
| POST   | `/screens`     | Admin | Create screen with seat layout     |
| PATCH  | `/screens/:id` | Admin | Update screen                      |
| DELETE | `/screens/:id` | Admin | Delete screen                      |

### Seats

| Method | Endpoint | Auth | Description                          |
| ------ | -------- | ---- | ------------------------------------ |
| GET    | `/seats` | —    | List seats for a screen (`screenId`) |

### Shows

| Method | Endpoint     | Auth  | Description                                |
| ------ | ------------ | ----- | ------------------------------------------ |
| GET    | `/shows`     | —     | List shows (filter: `screenId`, `movieId`) |
| GET    | `/shows/:id` | —     | Get show with movie & screen details       |
| POST   | `/shows`     | Admin | Create show (validates overlap)            |
| DELETE | `/shows/:id` | Admin | Delete show                                |

### Pricing

| Method | Endpoint       | Auth  | Description                        |
| ------ | -------------- | ----- | ---------------------------------- |
| GET    | `/pricing`     | —     | List pricing (filter: `theaterId`) |
| GET    | `/pricing/:id` | —     | Get pricing by ID                  |
| POST   | `/pricing`     | Admin | Create pricing rule                |
| PATCH  | `/pricing/:id` | Admin | Update pricing                     |
| DELETE | `/pricing/:id` | Admin | Delete pricing                     |

### Bookings

| Method | Endpoint               | Auth | Description                   |
| ------ | ---------------------- | ---- | ----------------------------- |
| GET    | `/bookings`            | JWT  | Get user's bookings           |
| POST   | `/bookings/lock`       | JWT  | Lock seats (10-min hold)      |
| POST   | `/bookings/confirm`    | JWT  | Confirm booking after payment |
| POST   | `/bookings/release`    | JWT  | Release locked seats          |
| PATCH  | `/bookings/:id/cancel` | JWT  | Cancel a confirmed booking    |

## Database Schema

```
User ──< Booking ──< BookedSeat >── Seat >── Screen >── Theater
                        │                       │
                        └──── Shows ─────────────┘
                                │
                              Movie

Theater ──< Pricing
```

**Key models**: User, Movie, Theater, Screen, Seat, Shows, Pricing, Booking, BookedSeat

**Enums**: Role (REGULAR, ADMIN) · Genre (ACTION, HORROR, THRILLER, ROMANCE, COMEDY) · SeatCategory (SILVER, GOLD, RECLINER) · TimeSlot (MORNING, EVENING) · DayType (WEEKDAY, WEEKEND) · BookingStatus (PENDING, CONFIRMED, CANCELLED)

## Booking Flow

1. **Browse** — User searches movies, theaters, and shows
2. **Lock** — `POST /bookings/lock` with `showId` and `seatIds` → seats held in Redis for 10 minutes
3. **Confirm** — `POST /bookings/confirm` → booking created with calculated prices, Redis locks released
4. **Cancel** (optional) — `PATCH /bookings/:id/cancel` → status set to CANCELLED

## Project Structure

```
fe/                              # Frontend (Next.js)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (navbar, footer, providers)
│   │   ├── template.tsx         # Page transition animations
│   │   ├── page.tsx             # Homepage (hero, features, CTA)
│   │   ├── login/page.tsx       # Login page
│   │   └── signup/page.tsx      # Signup page
│   ├── components/
│   │   ├── navbar.tsx           # Navbar (search, city, theme, mobile menu)
│   │   ├── footer.tsx           # Footer (links, social, legal)
│   │   ├── city-selector.tsx    # City selection modal
│   │   ├── theme-provider.tsx   # Dark/light mode provider
│   │   ├── theme-toggle.tsx     # Theme toggle button
│   │   ├── google-auth-provider.tsx  # Google OAuth wrapper
│   │   ├── query-provider.tsx   # React Query provider
│   │   ├── motion.tsx           # Framer Motion animation wrappers
│   │   ├── skeletons.tsx        # Loading skeleton components
│   │   └── ui/                  # shadcn/ui components
│   └── lib/
│       └── api.ts               # Axios instance with JWT interceptors
├── Dockerfile
└── package.json

be/                              # Backend (NestJS)
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Migration history
├── src/
│   ├── main.ts                  # App bootstrap (port 3333)
│   ├── app.module.ts            # Root module
│   ├── auth/                    # Authentication (JWT, Google SSO, guards)
│   ├── bookings/                # Booking logic & seat locking
│   ├── movies/                  # Movie CRUD
│   ├── theaters/                # Theater CRUD
│   ├── screens/                 # Screen CRUD + seat layout
│   ├── seats/                   # Seat queries
│   ├── shows/                   # Show scheduling
│   ├── pricing/                 # Dynamic pricing rules
│   ├── prisma/                  # Prisma service
│   └── redis/                   # Redis service
├── Dockerfile
├── package.json
└── vitest.config.ts
```

## Scripts

```bash
npm run build            # Compile TypeScript
npm run start:dev        # Dev server with hot reload
npm run start:debug      # Debug mode
npm run start:prod       # Production
npm run migrate          # Run Prisma migrations
npm test                 # Run tests
npm run test:watch       # Tests in watch mode
npm run test:coverage    # Tests with coverage report
```

## License

ISC
