// --- Auth & User Types ---
// Legacy type exports retained for backward compatibility with governance-data
// and other modules. New code should use types from `@/lib/auth-service`.

/**
 * @deprecated Legacy role type with old vocabulary.
 * New code should use `UserRole` from `@/lib/auth-service`.
 */
export type LegacyUserRole = "farmer" | "coop_admin" | "member";

/**
 * @deprecated Legacy user type. New code should use `AuthUser` from `@/lib/auth-service`.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: LegacyUserRole;
  cooperativeId?: string;
  farmId?: string;
  avatarInitials: string;
  createdAt: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
}

export interface Cooperative {
  id: string;
  name: string;
  region: string;
  province: string;
  memberCount: number;
  adminUserId: string;
  plan: "campo" | "agricoltore" | "cooperativa";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OTPRequest {
  phone: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}

// --- Seed Data (used by governance-data for demo/mock UI) ---

export const users: AuthUser[] = [
  {
    id: "user-tondini",
    email: "marco@tondini.farm",
    name: "Marco Tondini",
    phone: "+39 347 123 4567",
    role: "coop_admin",
    cooperativeId: "coop-romagna-unita",
    farmId: "azienda-tondini",
    avatarInitials: "MT",
    createdAt: "2025-01-15T08:00:00+01:00",
  },
  {
    id: "user-rossi",
    email: "giulia@sanvittore.it",
    name: "Giulia Rossi",
    phone: "+39 348 234 5678",
    role: "member",
    cooperativeId: "coop-romagna-unita",
    farmId: "podere-san-vittore",
    avatarInitials: "GR",
    createdAt: "2025-02-20T10:00:00+01:00",
  },
  {
    id: "user-bianchi",
    email: "luca@lafratta.it",
    name: "Luca Bianchi",
    phone: "+39 349 345 6789",
    role: "farmer",
    farmId: "tenuta-fratta",
    avatarInitials: "LB",
    createdAt: "2025-03-10T09:00:00+01:00",
  },
  {
    id: "user-verdi",
    email: "anna@cabianca.farm",
    name: "Anna Verdi",
    phone: "+39 350 456 7890",
    role: "member",
    cooperativeId: "coop-romagna-unita",
    farmId: "azienda-ca-bianca",
    avatarInitials: "AV",
    createdAt: "2025-03-25T11:00:00+01:00",
  },
];

export const cooperatives: Cooperative[] = [
  {
    id: "coop-romagna-unita",
    name: "Cooperativa Romagna Unita",
    region: "Emilia-Romagna",
    province: "Forlì-Cesena",
    memberCount: 4,
    adminUserId: "user-tondini",
    plan: "cooperativa",
  },
];
