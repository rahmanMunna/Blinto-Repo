/**
 * Shapes mirrored from the NestJS backend (../backend/src).
 * Keep these in sync with the entities + DTOs there.
 */

/** backend/src/user/entity/user.entity.ts (minus the password column) */
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

/** backend/src/url/entity/url.entity.ts */
export interface ShortUrl {
  id: string;
  short_code: string;
  original_url: string;
  created_at: string;
  visit_count: number;
}

/** Decoded payload of the access token — { sub, username, role } */
export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

/** POST /auth/login, POST /auth/refresh and GET /auth/google/callback all return this */
export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

/** POST /auth/register body — RegisterGuestDto */
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/** POST /auth/login body — LoginDto */
export interface LoginPayload {
  username: string;
  password: string;
}
