# Astrix (ExamForge)

Astrix is a premium, campus-restricted academic intelligence platform exclusively for the students of **IIITDM Jabalpur**. It allows students to share previous year question papers (PYQs), earn virtual coins for contributions, and unlock study materials.

## Features (Phase 1)

- **Domain-Restricted Auth:** Google OAuth restricted to `@iiitdmj.ac.in`.
- **Coin Economy:** Automatic 20 coin balance for new users.
- **Premium UI:** Dark-themed, glassmorphism design with Framer Motion animations.
- **Protected Dashboard:** Secure access to user-specific academic insights.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** MongoDB Atlas with Mongoose
- **Authentication:** Auth.js (NextAuth v5)
- **Styling:** Tailwind CSS, shadcn/ui
- **Animations:** Framer Motion

## Getting Started

### 1. Prerequisites
- Node.js 18+ 
- MongoDB Atlas cluster
- Google Cloud Project (for OAuth credentials)

### 2. Environment Setup
Create a `.env.local` file in the root directory and fill in the following:

```env
MONGODB_URI=your_mongodb_atlas_uri
AUTH_SECRET=your_nextauth_secret (generate with `npx auth secret`)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Installation
```bash
npm install
```

### 4. Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture Highlights

- **`src/auth.ts`**: Centralized authentication logic and domain enforcement.
- **`src/lib/db.ts`**: Cached MongoDB connection utility for serverless environments.
- **`src/middleware.ts`**: Route protection and intelligent redirects.
- **`src/models/User.ts`**: Mongoose schema for the platform's user base.

## License
Private - IIITDM Jabalpur Students only.
