# QR Entry

A modern, high-throughput multi-event participant registration and QR admission system. Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, and Brevo.

The application allows organizers to manage multiple events, accept attendee registrations, dispatch tickets with inline QR codes via email, and rapidly admit attendees at entrances using a mobile or desktop camera scanner.

---

## Features

### Multi-Event Management
- **Dynamic Event Creation:** Organizers can create, edit, activate, pause, and delete events with dedicated titles, locations, dates, descriptions, and URL slugs.
- **Cross-Event Verification:** Prevents unauthorized admission when an attendee presents a QR code for a different event, providing organizers with an instant notification and an option to switch events.
- **Attendee Directory & Export:** View filtered attendee lists per event or across all events, search by attendee name or email, manually toggle admission, delete entries, and copy CSV data to the clipboard.

### Public Registration & Ticketing
- **Registration Form:** Validated using `react-hook-form` and `zod`, capturing participant details (name, email, parish/residence) and associating them with the active event.
- **Instant Digital Pass:** Directs confirmed attendees to a dedicated ticket page (`/registrace/uspech?id=...`) displaying the participant pass, downloadable PNG QR code, and `.ics` calendar invitation.
- **Email Delivery:** Dispatches confirmation emails via the Brevo transactional email API using React Email templates. QR codes are included as attachments.

### Check-in Terminal (`/checkin`)
- **Protected Access:** Secured with password-based authentication and signed HTTP-only JWT session cookies using `jose`.
- **In-Browser Optical Scanner:** Powered by `html5-qrcode` with support for front/rear camera selection and a manual toggle to disable camera streams and conserve device battery.
- **Audio-Visual Feedback:** Synthesized sound cues via the Web Audio API provide instant confirmation for valid tickets, duplicate entries, mismatched events, and unknown codes without external media files.
- **Manual Lookup:** Organizers can search and check in participants by name, email, or registration UUID when scanning a physical display is not possible.
- **Reversible Check-in:** Organizers can undo accidental check-in operations with a single click.

### Theme & Contrast Architecture
- **Semantic Color Tokens:** Supports light and dark modes through CSS custom properties without relying on static mode overrides.
- **Optical Ticket Isolation:** QR code tickets and physical print passes are strictly isolated to high-contrast light backgrounds for reliable hardware scanning.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, Server Actions, Partial Prerendering) |
| Language | TypeScript |
| Styling | Tailwind CSS, Lucide React icons, Radix UI primitives |
| Database & ORM | PostgreSQL, Prisma ORM (with in-memory offline fallback) |
| Email Service | Brevo transactional email API, React Email (`@react-email/components`) |
| QR Code Engine | `qrcode` (generation), `html5-qrcode` (camera scanning) |
| Security | `jose` (JWT cookie sessions) |
| Linter & Formatter | Biome (`@biomejs/biome`) |

---

## Project Structure

```
qr-entry/
├── prisma/
│   └── schema.prisma              # Database schema (Event and Registration models)
├── public/
│   ├── mdp-icon.png               # Organization icon asset
│   └── mdp-logo.png               # Organization logo asset
├── src/
│   ├── app/
│   │   ├── actions/               # Server Actions (auth, checkin, events, registration)
│   │   ├── api/qr/[code]/         # Dynamic PNG QR code HTTP endpoint
│   │   ├── checkin/               # Organizer admission terminal and event management modal
│   │   ├── registrace/            # Public registration form and ticket pass pages
│   │   ├── globals.css            # Global styles and semantic color token definitions
│   │   ├── layout.tsx             # Root layout with theme initialization script
│   │   └── page.tsx               # Public landing page with active event listings
│   ├── components/
│   │   ├── ui/                    # Reusable primitive UI components
│   │   ├── Footer.tsx             # Public footer
│   │   ├── Navbar.tsx             # Public header navigation
│   │   └── ThemeToggle.tsx        # Light/dark mode toggle button
│   ├── emails/
│   │   └── TicketEmail.tsx        # React Email template for participant confirmation
│   └── lib/
│       ├── auth.ts                # Session token signing and verification
│       ├── email.ts               # Brevo email client with QR code attachments
│       ├── prisma.ts              # Prisma database client singleton
│       ├── qrcode.ts              # QR code generation (Data URL and Buffer)
│       ├── registrations.ts       # Registration and event service layer
│       ├── sounds.ts              # Web Audio API sound synthesis
│       └── validations.ts         # Zod schemas for forms and check-in parameters
├── .env.example                   # Environment configuration template
├── biome.json                     # Biome linter and formatter configuration
├── next.config.ts                 # Next.js configuration
└── package.json                   # Dependencies and scripts
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure the values:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
|---|---|---|
| `POSTGRES_PRISMA_URL` | PostgreSQL connection string (pooling) | `postgresql://...` |
| `POSTGRES_URL_NON_POOLING` | Direct PostgreSQL connection string | `postgresql://...` |
| `BREVO_API_KEY` | Brevo API key for outbound emails | `xkeysib-...` |
| `EMAIL_FROM` | Verified sender display name and email address | `Event Team <tickets@example.com>` |
| `ADMIN_PASSWORD` | Password for accessing the `/checkin` terminal | `change-me-to-a-secure-password` |
| `AUTH_SECRET` | Secret key for signing session tokens (min. 32 chars) | `your-secure-random-auth-secret` |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the deployment | `http://localhost:3000` |

If no database connection string is provided during local development, the application automatically falls back to an in-memory repository to allow offline testing.

---

## Getting Started

### Prerequisites
- Node.js 20.x or later
- pnpm 9.x or later

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Generate the Prisma client:
   ```bash
   pnpm prisma generate
   ```

3. Synchronize the database schema:
   ```bash
   pnpm prisma db push
   ```

4. Run the code quality checks:
   ```bash
   pnpm biome check
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) for the public portal or [http://localhost:3000/checkin](http://localhost:3000/checkin) for the organizer check-in terminal.

---

## Scripts

- `pnpm dev`: Starts the Next.js development server.
- `pnpm build`: Creates an optimized production build.
- `pnpm start`: Starts the Next.js production server.
- `pnpm lint`: Runs code quality checks using Biome.
- `pnpm format`: Formats code files using Biome.

---

## Production Deployment (Vercel)

1. Connect the repository to Vercel.
2. Under **Storage**, provision a **Vercel Postgres** or **Neon** database instance. The connection strings (`POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`) will be populated automatically.
3. Configure the remaining environment variables in the project settings:
   - `ADMIN_PASSWORD`
   - `AUTH_SECRET`
   - `BREVO_API_KEY`
   - `EMAIL_FROM`
   - `NEXT_PUBLIC_APP_URL` (set to your production domain)
4. Trigger the deployment.
5. Apply database migrations or run `pnpm prisma db push` against the production database.
