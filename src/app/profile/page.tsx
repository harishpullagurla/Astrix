import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Resource from "@/models/Resource";
import { parseIIITDMJEmail } from "@/lib/iiitdmj-utils";
import { 
  User as UserIcon, 
  Wallet, 
  BarChart3, 
  LogOut, 
  CheckCircle2, 
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions";

export default async function ProfilePage() {
  const session = await auth();
  if (!session || !session.user) redirect("/");

  await connectToDatabase();
  const userData = await User.findOne({ email: session.user.email });
  
  // Stats calculation
  const totalUploads = await Resource.countDocuments({ uploader: userData?._id });
  const resources = await Resource.find({ uploader: userData?._id });
  const avgQuality = resources.length > 0 
    ? (resources.reduce((acc, curr) => acc + (curr.qualityScore || 0), 0) / resources.length).toFixed(1)
    : "0";

  const iiitdmjInfo = parseIIITDMJEmail(session.user.email || "");

  return (
    <div className="min-h-screen bg-[#030303] text-white relative">
      {/* Consistent Background Gradients like other pages */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Page Header - Balanced & Vibrant */}
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight font-sans">
            My <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Profile</span>
          </h1>
          <p className="text-zinc-500 text-lg font-inter">
            Manage your academic identity and track your contributions.
          </p>
        </div>

        {/* Header Section - Better Sizing */}
        <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-3xl bg-white/[0.02] border border-white/10">
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-25"></div>
            <div className="relative w-24 h-24 rounded-full bg-black p-1">
              {session.user.image ? (
                <img src={session.user.image} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900 rounded-full">
                  <UserIcon className="w-10 h-10 text-zinc-700" />
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight mb-1">{session.user.name}</h1>
            <p className="text-zinc-500 text-base font-medium mb-4">{session.user.email}</p>
            
            {iiitdmjInfo && (
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest border border-purple-500/20">
                  {iiitdmjInfo.branch}
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-500/20">
                  {iiitdmjInfo.program} • Year {iiitdmjInfo.currentYear}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-zinc-400 text-xs font-bold uppercase tracking-widest border border-white/10">
                  Batch of {iiitdmjInfo.batch}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid - Balanced Sizing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Wallet Card */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col justify-between group hover:border-yellow-500/20 transition-colors">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-yellow-500" />
                </div>
                <h2 className="font-bold text-zinc-500 uppercase tracking-widest text-xs">Wallet Balance</h2>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-black tabular-nums tracking-tighter">{userData?.coins || 0}</span>
                <span className="text-yellow-500 font-bold text-sm uppercase tracking-widest">AST Coins</span>
              </div>
              <p className="text-zinc-500 text-sm italic">Earned through quality contributions.</p>
            </div>
          </div>

          {/* Performance Card */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col justify-between group hover:border-purple-500/20 transition-colors">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="font-bold text-zinc-500 uppercase tracking-widest text-xs">Your Stats</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-4xl font-black block">{totalUploads}</span>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Total Uploads</span>
              </div>
              <div>
                <span className="text-4xl font-black block text-green-400">{avgQuality}/10</span>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Avg Quality</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="pt-4">
          <form action={signOutAction}>
            <Button 
              variant="destructive" 
              className="w-full h-16 rounded-2xl gap-3 font-bold text-sm uppercase tracking-[0.2em] bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign Out from Account
            </Button>
          </form>
        </div>
      </main>

    </div>
  );
}
