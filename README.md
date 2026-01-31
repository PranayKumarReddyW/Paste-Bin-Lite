# Pastebin Lite

A lightweight pastebin application for creating and sharing text snippets with optional expiry times and view count limits.

## Features

- Create text pastes with shareable URLs
- Time-based expiry (TTL in seconds)
- View-count limits
- Clean, modern UI with Tailwind CSS
- Redis persistence for reliability
- Secure with input validation and XSS prevention

## Tech Stack

Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Redis (ioredis)

## Quick Start

```bash
# Install dependencies
npm install

# Start Redis
docker-compose up -d

# Run development server
npm run dev
```

Visit: **http://localhost:3000**

## Environment Setup

Create `.env.local`:

```env
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## API Endpoints

### Health Check

```
GET /api/healthz
```

Returns: `{"ok": true}`

### Create Paste

```
POST /api/pastes
Content-Type: application/json

{
  "content": "string",      # Required
  "ttl_seconds": 60,        # Optional
  "max_views": 5            # Optional
}
```

Returns: `{"id": "abc123", "url": "http://localhost:3000/p/abc123"}`

### Get Paste (API)

```
GET /api/pastes/:id
```

Returns: `{"content": "...", "remaining_views": 4, "expires_at": "2026-01-31T..."}`

### View Paste (Browser)

```
GET /p/:id
```

Renders paste as HTML page

## Deployment (Vercel)

### 1. Setup Redis

- Go to [upstash.com](https://console.upstash.com/)
- Create free Redis database
- Copy connection URL

### 2. Deploy to Vercel

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

Then in Vercel:

- Import your GitHub repo
- Add environment variable: `REDIS_URL=<your-upstash-url>`
- Deploy

## Persistence Layer

**Redis** - Fast in-memory store with built-in TTL support

- **Local Development**: Docker Compose
- **Production**: Upstash Redis (recommended for Vercel)

## Testing

### Manual Test

```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Test paste","max_views":3}'
```

### Automated Tests

```bash
npm run test:api
```

## Project Structure

```
app/
├── api/
│   ├── healthz/        # Health check endpoint
│   └── pastes/         # Paste CRUD endpoints
├── p/[id]/             # HTML paste view page
├── layout.tsx          # Root layout
└── page.tsx            # Home page
lib/
├── redis.ts            # Redis client
├── paste.ts            # Core paste logic
└── utils.ts            # Utilities
components/ui/          # shadcn/ui components
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run redis:start  # Start Redis via Docker
npm run redis:stop   # Stop Redis
npm run test:api     # Run API tests
npm run type-check   # TypeScript type checking
```

## Key Design Decisions

1. **Redis for Persistence** - Fast, built-in TTL support, serverless-friendly
2. **Atomic View Counting** - Prevents race conditions under concurrent load
3. **Full TypeScript** - Type safety throughout the application
4. **Modular Architecture** - Clean separation of concerns (lib/, app/, components/)
5. **Security First** - Input validation, XSS prevention, security headers

## How Constraints Work

| Constraint    | Behavior                                         |
| ------------- | ------------------------------------------------ |
| `ttl_seconds` | Paste auto-expires after N seconds               |
| `max_views`   | Paste deleted after N views                      |
| Both set      | Paste deleted when **first** constraint triggers |

## License

MIT
