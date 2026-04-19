import { InMemoryStore } from "@/lib/db";

// --- Auth & User Types ---

export type UserRole = "farmer" | "coop_admin" | "member";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
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

// --- Seed Data ---

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

// Demo auth: in production, replace with NextAuth.js / Auth.js
const DEMO_PASSWORD = "agriromagna2025";

export function authenticateUser(email: string, password: string): AuthResponse {
  if (password !== DEMO_PASSWORD) {
    return { success: false, error: "Credenziali non valide." };
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return { success: false, error: "Utente non trovato." };
  }

  const token = `demo-token-${user.id}-${Date.now()}`;
  return { success: true, user, token };
}

export function getUserByToken(token: string): AuthUser | undefined {
  const match = token.match(/^demo-token-(user-\w+)-/);
  if (!match) return undefined;
  return users.find((u) => u.id === match[1]);
}

export function authorizeRole(user: AuthUser, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(user.role);
}

export function getCooperativeMembers(cooperativeId: string): AuthUser[] {
  return users.filter((u) => u.cooperativeId === cooperativeId);
}

export const usersStore = new InMemoryStore<AuthUser>();
usersStore.seed(users.map((u) => ({ ...u })));
