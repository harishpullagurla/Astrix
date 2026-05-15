# Astrix: Technical Post-Mortem & Implementation Log

This document serves as a complete record of the features, architectural decisions, and challenges overcome during the development of **Astrix (formerly ExamForge)**.

---

## 1. Core Architecture
Astrix is built as a **Next.js 15+** application using the **App Router**, with a focus on speed, security, and AI-driven automation.

### **Tech Stack**
- **Framework:** Next.js (React 19, TypeScript)
- **Database:** MongoDB (via Mongoose)
- **Authentication:** NextAuth.js (Google Provider restricted to `@iiitdmj.ac.in`)
- **AI Engine:** Google Gemini 2.5 Flash
- **Styling:** Tailwind CSS + Framer Motion (for animations)
- **Icons:** Lucide React

---

## 2. Implemented Features & Logic

### **A. AI-Powered Secure Uploads**
Every academic resource (PDF/Image) uploaded undergoes a strict audit by Gemini 2.5.
- **Verification:** The AI analyzes content to ensure it is academic and relevant to the provided subject.
- **Auto-Correction:** If a user provides an old or incorrect subject code (e.g., `CS202`), the AI maps it to the latest IIITDMJ curriculum (e.g., `CS2006` for OS).
- **Quality Scoring:** AI assigns a score from 1-10, which directly influences the user's reward.

### **B. Anti-Misuse & Security**
To prevent "coin farming" and spam, several layers were added:
- **SHA-256 Hashing:** Every file is digitally fingerprinted. Re-uploading the exact same file (even with a different name) triggers a `Duplicate Content` error.
- **Spam Throttling:** Users are limited to 3 uploads per category and 5 Insights posts per 24 hours.
- **IIITDMJ Restriction:** Sign-in is hard-locked to official college emails.

### **C. The AST Coin Economy**
A circular economy that encourages sharing:
- **Earn:** 10 coins for high quality, 5 for fair, 2 for basic. Rewards are slashed if the user spams the same category.
- **Spend:** Each "Unlock" costs 5 AST coins.
- **Library:** Once unlocked, resources are permanently stored in the user's personal vault.

### **D. Academic Explorer (Search & Directory)**
- **Search Engine:** A real-time, debounced search with filters for Semester and Category.
- **Directory Hierarchy:** A structured virtual folder system: `Semesters -> Subjects -> Categories -> Subcategories -> Files`.
- **Skeleton Loading:** Custom loaders were implemented to eliminate "flickering/blinking" during tab switching.

### **E. Personalized Identity**
- **Roll Number Parsing:** A custom utility extracts Batch, Branch (CSE, ECE, ME, DS, SM), and Program (B.Tech, M.Tech, etc.) directly from the user's email prefix (e.g., `24BCS201`).
- **Profile Hub:** A premium UI showing wallet balance and contribution impact stats.

---

## 3. Challenges & Resolutions

| Issue | Cause | How We Overcame It |
| :--- | :--- | :--- |
| **API 404 Errors** | Gemini 1.5 was deprecated mid-2026. | Upgraded to **Gemini 2.5 Flash** for better reliability and faster audits. |
| **UI Flickering** | State resets during search and tab switching. | Implemented **Skeleton Loading** and optimized `AnimatePresence` keys. |
| **Incorrect Tagging** | Users provided outdated subject codes. | Hard-coded the latest **IIITDMJ Curriculum** into the AI's prompt to act as the "Source of Truth." |
| **Build Errors** | Improper string escaping in JSX (`Expected unicode escape`). | Cleaned up component code to use standard JSX syntax without manual backslashes. |
| **False Rejections** | AI was too strict about "IIITDMJ" logos. | Adjusted prompt to focus on **Academic Quality** first, allowing faculty resources without branding. |

---

## 4. Future Roadmap
1. **Protected File Storage:** Move files from `public/uploads` to a private bucket and serve via protected API routes.
2. **Community Discussion:** Threads and peer-review systems for each resource.
3. **Admin Dashboard:** Advanced moderation tools to override AI decisions.
4. **Download Button:** Dedicated button for offline access.

---
*Created with ❤️ for IIITDMJ Students.*
