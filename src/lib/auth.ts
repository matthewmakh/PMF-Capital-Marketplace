import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { isMFARequired } from "./mfa";

// Maximum age (in ms) for mfaVerifiedAt to be considered valid when updating JWT.
// The /api/mfa/verify route sets mfaVerifiedAt in the DB; the JWT callback checks
// that this timestamp is recent before flipping the token flag. This closes the
// attack vector where a client calls updateSession({ mfaVerified: true }) without
// actually completing MFA verification.
const MFA_VERIFY_WINDOW_MS = 30_000; // 30 seconds

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.isActive) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        const mfaRequired = await isMFARequired(prisma);

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isHidden: user.isHidden,
          mfaEnabled: user.mfaEnabled,
          mfaRequired,
          // If MFA is required, user starts unverified regardless
          mfaVerified: !mfaRequired,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email!;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.isHidden = user.isHidden;
        token.mfaEnabled = user.mfaEnabled;
        token.mfaRequired = user.mfaRequired;
        token.mfaVerified = user.mfaVerified;
      }
      // Session update — verify against DB before trusting mfaVerified
      if (trigger === "update" && session?.mfaVerified === true) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { mfaVerifiedAt: true },
        });
        if (
          dbUser?.mfaVerifiedAt &&
          Date.now() - dbUser.mfaVerifiedAt.getTime() < MFA_VERIFY_WINDOW_MS
        ) {
          token.mfaVerified = true;
        }
        // If DB doesn't confirm recent MFA verification, ignore the client request
      }
      if (trigger === "update" && session?.mfaEnabled !== undefined) {
        // Verify mfaEnabled against DB too
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { mfaEnabled: true },
        });
        if (dbUser) {
          token.mfaEnabled = dbUser.mfaEnabled;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = session.user as any;
      user.id = token.id;
      user.firstName = token.firstName;
      user.lastName = token.lastName;
      user.role = token.role;
      user.isHidden = token.isHidden;
      user.mfaEnabled = token.mfaEnabled;
      user.mfaRequired = token.mfaRequired;
      user.mfaVerified = token.mfaVerified;
      return session;
    },
  },
});
