export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface SignupPayload extends Credentials {
  name: string;
}

/** What the auth endpoints hand back: the user plus the JWT to carry. */
export interface AuthSession {
  user: User;
  token: string;
}

export interface ProfileUpdate {
  name: string;
  email: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}
