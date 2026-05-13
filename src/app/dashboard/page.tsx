import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { 
  LogOut, 
  Coins, 
  Upload, 
  Search, 
  BookMarked, 
  User as UserIcon,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AstrixLogo } from "@/components/logo";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AstrixLogo size={28} />
            <span className="font-semibold tracking-tight text-lg">Astrix</span>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white hover:bg-white/5 gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <DashboardClient session={session} />
      </main>
    </div>
  );
}
