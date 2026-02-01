# ComprendeYa Web

Frontend web application for ComprendeYa, a Spanish language comprehension tool. This React application provides the user interface for processing YouTube videos and displaying comprehension exercises.

## Prerequisites

- Node.js (v18+)
- npm

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and configure the API URL:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_API_URL=http://localhost:8000
```

The `VITE_API_URL` should point to your running ComprendeYa API instance.

## Development

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
comprende-ya-web/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and API client
│   ├── routes/         # File-based routing (TanStack Router)
│   ├── styles/         # Global CSS
│   └── types/          # TypeScript type definitions
├── package.json
└── vite.config.ts
```

## Technologies

- React 19
- TanStack Start (full-stack React framework)
- TanStack Router (file-based routing)
- TanStack Query (data fetching)
- Tailwind CSS
- shadcn/ui components
- TypeScript
- Vite

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
