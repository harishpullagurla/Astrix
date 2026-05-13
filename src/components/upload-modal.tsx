"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Upload, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { uploadPaper } from "@/lib/actions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function UploadModal({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsUploading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await uploadPaper(formData);
      
      if (result.success) {
        setIsSuccess(true);
        toast.success("Paper uploaded successfully! +10 Coins earned.");
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a] border-white/10 text-white p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8"
            >
              <DialogHeader className="mb-8">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Upload PYQ
                </DialogTitle>
                <DialogDescription className="text-zinc-500 font-inter">
                  Share your academic papers and earn 10 AST coins.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 font-inter">
                <div className="space-y-2">
                  <Label htmlFor="file" className="text-zinc-400">PDF or Image File</Label>
                  <Input 
                    id="file" 
                    name="file" 
                    type="file" 
                    accept=".pdf,image/*" 
                    required 
                    className="bg-white/5 border-white/10 text-white file:text-purple-400 file:bg-purple-500/10 file:border-0 file:rounded-md file:mr-4 hover:bg-white/10 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-zinc-400">Paper Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="e.g. Data Structures Mid-Sem 2023" 
                    required 
                    className="bg-white/5 border-white/10 text-white focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subjectCode" className="text-zinc-400">Subject Code</Label>
                    <Input 
                      id="subjectCode" 
                      name="subjectCode" 
                      placeholder="CS202" 
                      required 
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-zinc-400">Year</Label>
                    <Input 
                      id="year" 
                      name="year" 
                      type="number" 
                      defaultValue={new Date().getFullYear()} 
                      required 
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Semester</Label>
                    <Select name="semester" defaultValue="1">
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        {[1,2,3,4,5,6,7,8].map((s) => (
                          <SelectItem key={s} value={s.toString()}>Sem {s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Exam Type</Label>
                    <Select name="examType" defaultValue="Mid-Sem">
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        <SelectItem value="Mid-Sem">Mid-Sem</SelectItem>
                        <SelectItem value="End-Sem">End-Sem</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white h-12 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-purple-500/20"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading Paper...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Confirm Contribution
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-2">Contribution Successful!</h3>
                <p className="text-zinc-400">Your paper is now live. We've added 10 AST coins to your balance.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
