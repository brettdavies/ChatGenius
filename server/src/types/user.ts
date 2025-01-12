declare global {
  namespace Express {
    interface User {
      auth0_id: string;
      db_id: string;
      email: string;
      username: string;
      full_name: string;
      avatar_url?: string;
    }
  }
}

export {}; 