# ☄️ Astrix (formerly ExamForge)

**Your one-stop academic intelligence platform for IIITDMJ.**  
Access past papers, share study resources, and earn rewards through an AI-verified ecosystem.


## 🚀 Key Features

### 🤖 AI-Driven Auditing
- **Automated Validation:** Every upload is vetted by **Gemini 2.5 Flash** for academic relevance and quality.
- **Smart Categorization:** AI automatically maps documents to the latest **IIITDMJ Curriculum** (e.g., CS2006 for OS).
- **Anti-Spam:** Content moderation for the community "Insights" tab.

### 💰 AST Coin Economy
- **Contribute to Earn:** Share high-quality papers and notes to earn AST coins.
- **Unlock Knowledge:** Spend coins to gain access to premium resources contributed by peers.
- **Fairness First:** Throttled rewards and duplicate detection prevent "farming" and ensure high-quality content.

### 📂 Academic Explorer
- **Smart Search:** Filter by Semester, Category, or keyword.
- **Virtual Directory:** Navigate through a familiar folder hierarchy: `Semesters > Subjects > Files`.
- **Skeleton Loaders:** Zero-flicker UI for a smooth searching experience.

### 👤 Personalized Hub
- **Email Intelligence:** Automatically parses IIITDMJ roll numbers to show your Batch, Branch, and Program.
- **Contribution Stats:** Track your impact with real-time approval rates and quality scores.

---

## 🛠️ Tech Stack

- **Frontend:** [Next.js 15+](https://nextjs.org/) (App Router), [React 19](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend:** Next.js Server Actions, [MongoDB](https://www.mongodb.com/) (Mongoose)
- **AI:** [Google Gemini 2.5 Flash](https://ai.google.dev/)
- **Auth:** [NextAuth.js](https://next-auth.js.org/) (Google Provider)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js 20+
- MongoDB instance (Atlas or local)
- Google Cloud Console credentials (for Auth)
- Gemini API Key

### 2. Environment Setup
Create a `.env.local` file in the root:

```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
GEMINI_API_KEY=your_gemini_key
```

### 3. Installation
```bash
npm install
npm run dev
```

---

## 🛡️ Security Measures
- **Digital Fingerprinting:** SHA-256 hashing to detect and block duplicate file uploads.
- **Restricted Access:** Hard-locked to `@iiitdmj.ac.in` email domains.
- **Rate Limiting:** Protects the platform from automated spam and bot activity.

---

