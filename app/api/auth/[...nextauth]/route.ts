import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

// This will be replaced with a real database once MongoDB is connected
const MOCK_USERS = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    // Password: "password123"
    password: "$2b$10$8OuEVxfkEC5aXJRn.Y2rAO3x2IPNDK2qHqWx/hDzdRvVcWB7Kp.hm",
    image: "https://placehold.co/400"
  }
];

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        // In a real implementation, we would query the MongoDB database
        const user = MOCK_USERS.find(user => user.email === credentials.email);
        
        if (!user) {
          throw new Error("User not found");
        }

        // Use bcrypt to compare the password
        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST }; 