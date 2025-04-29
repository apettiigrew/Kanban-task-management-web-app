import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string | null;
      name: string | null;
      firstName: string | null;
      lastName: string | null;
    }
  }

  interface User {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
  }
} 