import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import {
  authenticateUser,
  authenticateUserByPhone,
  getUserFromRequest,
  normalizePhone,
  refreshAccessToken,
  registerUser,
} from "@/lib/auth-service";
import { config } from "@/lib/config";
import { checkAuthRateLimit } from "@/lib/rate-limiter";
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  requestOtpSchema,
  verifyOtpSchema,
} from "@/lib/validators/schemas";

const OTP_COOKIE = "otp_challenge";

function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: config.IS_PRODUCTION,
    path: "/",
    maxAge,
  };
}

async function applySessionCookies(tokens: { accessToken: string; refreshToken: string }) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", tokens.accessToken, sessionCookieOptions(60 * 15));
  cookieStore.set("refresh_token", tokens.refreshToken, sessionCookieOptions(60 * 60 * 24 * 7));
  cookieStore.delete(OTP_COOKIE);
}

function validationErrorResponse(error: unknown) {
  const issues = (error as { issues?: { path: string[]; message: string }[] })?.issues ?? [];
  const messages = issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  return Response.json(
    { success: false, error: messages || "Dati non validi." },
    { status: 400 }
  );
}

export async function POST(request: Request) {
  try {
    // Rate limit auth endpoints
    const rateLimited = checkAuthRateLimit(request);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const action = body.action ?? "login";
    const cookieStore = await cookies();

    if (action === "register") {
      const parsed = registerSchema.safeParse(body);
      if (!parsed.success) return validationErrorResponse(parsed.error);
      const data = parsed.data;
      const result = await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        cooperativeId: data.cooperativeId,
        farmId: data.farmId,
        phone: data.phone,
      });
      return Response.json(result, { status: result.success ? 201 : 400 });
    }

    if (action === "refresh") {
      const parsed = refreshTokenSchema.safeParse(body);
      if (!parsed.success) return validationErrorResponse(parsed.error);
      const refreshToken = parsed.data.refreshToken || cookieStore.get("refresh_token")?.value;
      if (!refreshToken) {
        return Response.json(
          { success: false, error: "Token di refresh mancante." },
          { status: 400 }
        );
      }
      const result = await refreshAccessToken(refreshToken);
      if (!result.success) {
        return Response.json(result, { status: 401 });
      }
      await applySessionCookies(result.tokens);
      return Response.json(result);
    }

    if (action === "request-otp") {
      const parsed = requestOtpSchema.safeParse(body);
      if (!parsed.success) return validationErrorResponse(parsed.error);
      const phone = normalizePhone(parsed.data.phone);
      if (phone.length < 9) {
        return Response.json(
          { success: false, error: "Inserisci un numero di telefono valido." },
          { status: 400 }
        );
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      const challenge = jwt.sign({ phone, code, type: "otp" }, config.JWT_SECRET, {
        expiresIn: "5m",
      });
      cookieStore.set(OTP_COOKIE, challenge, sessionCookieOptions(60 * 5));

      return Response.json({
        success: true,
        message: "Codice inviato via SMS demo. Inseriscilo entro 5 minuti.",
        devCode: config.IS_PRODUCTION ? undefined : code,
      });
    }

    if (action === "verify-otp") {
      const parsed = verifyOtpSchema.safeParse(body);
      if (!parsed.success) return validationErrorResponse(parsed.error);
      const phone = normalizePhone(parsed.data.phone);
      const code = parsed.data.code.trim();
      const challenge = cookieStore.get(OTP_COOKIE)?.value;

      if (!phone || !code || !challenge) {
        return Response.json(
          { success: false, error: "Richiedi un codice OTP prima di verificare l'accesso." },
          { status: 400 }
        );
      }

      try {
        const decoded = jwt.verify(challenge, config.JWT_SECRET) as { phone: string; code: string; type?: string };
        if (decoded.type !== "otp" || decoded.phone !== phone || decoded.code !== code) {
          return Response.json(
            { success: false, error: "Codice OTP non valido o scaduto." },
            { status: 401 }
          );
        }
      } catch {
        return Response.json(
          { success: false, error: "Codice OTP non valido o scaduto." },
          { status: 401 }
        );
      }

      const result = await authenticateUserByPhone(phone);
      if (!result.success) {
        return Response.json(result, { status: 401 });
      }

      await applySessionCookies(result.tokens);
      return Response.json({ success: true, user: result.user, tokens: result.tokens });
    }

    // Default: login
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const result = await authenticateUser(parsed.data.email, parsed.data.password);
    if (!result.success) {
      return Response.json(result, { status: 401 });
    }

    await applySessionCookies(result.tokens);
    return Response.json({ success: true, user: result.user, tokens: result.tokens });
  } catch {
    return Response.json(
      { success: false, error: "Errore durante l'autenticazione." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json(
      { success: false, error: "Token non valido o mancante." },
      { status: 401 }
    );
  }

  return Response.json({ success: true, user });
}
