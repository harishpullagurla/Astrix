import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email || !email.endsWith("@iiitdmj.ac.in")) {
          return false;
        }

        try {
          await connectToDatabase();
          const existingUser = await User.findOne({ email });

          if (!existingUser) {
            await User.create({
              name: user.name ?? "Unknown User",
              email: email,
              image: user.image ?? "",
              coins: 20,
              role: "student",
            });
          }
          return true;
        } catch (error) {
          console.error("Error saving user to database:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session }) {
      if (session.user) {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: session.user.email });
          if (dbUser) {
            session.user.id = dbUser._id.toString();
            (session.user as any).coins = dbUser.coins;
            (session.user as any).role = dbUser.role;
          }
        } catch (error) {
          console.error("Session callback error:", error);
        }
      }
      return session;
    },
  },
});
