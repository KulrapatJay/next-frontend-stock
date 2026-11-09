// API types (from Go-Backend-Stock docs/api/swagger.json)
export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    request_id: string;
    details?: string[];
  };
};

export type User = {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
};

export type SessionResponse = {
  expires_at: string;
  user: User;
};

export type OtpAccepted = {
  challenge_id: string;
  expires_in: number;
  message: string;
};

export type AuthConfig = {
  google_enabled: boolean;
};
