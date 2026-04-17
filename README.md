# Կանաչ Կամուրջ (Kanachakumb)

Event agency platform for Hasmik Mkrtchyan's 60+ community.

## Tech Stack
- **Backend**: FastAPI + PostgreSQL + SQLAlchemy (Render.com)
- **Frontend**: React + TypeScript + shadcn/ui (Vercel)

## Subscription Plans
- **Basic** — 40,000 AMD/month: bi-weekly meetings + benefits
- **Premium** — 55,000 AMD/month: everything + Telegram group

## Features
- Google & Apple Sign In/Sign Up
- JWT tokens (30-day access, 365-day refresh)
- Event opt-in/opt-out with capacity tracking
- Gift cards
- Admin CMS with analytics, event management, user management

## Setup

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in values
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local  # fill in values
npm run dev
```

## Deployment
- **Backend** → Render.com (uses `render.yaml`)
- **Frontend** → Vercel (uses `vercel.json`)
