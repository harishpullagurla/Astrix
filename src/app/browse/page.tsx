import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { getPapers, getUserUnlocks } from "@/lib/actions";
import BrowseClient from "./browse-client";

export default async function BrowsePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  const [initialPapers, unlockedPaperIds] = await Promise.all([
    getPapers(),
    getUserUnlocks(),
  ]);

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <BrowseClient 
          initialPapers={initialPapers} 
          unlockedPaperIds={unlockedPaperIds}
          currentUserId={(session.user as any).id}
        />
      </main>
    </div>
  );
}

