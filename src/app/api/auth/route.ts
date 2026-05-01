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

const JWT_SECRET = process.env.JWT_SECRET || "agri-romagna-dev-secret-change-in-production";
const OTP_COOKIE = "otp_challenge";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: IS_PRODUCTION,
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action ?? "login";
    const cookieStore = await cookies();

    if (action === "register") {
      if (!body.email || !body.password || !body.name) {
        return Response.json(
          { success: false, error: "Email, password e nome sono obbligatori." },
          { status: 400 }
        );
      }
      const result = await registerUser({
        email: body.email,
        password: body.password,
        name: body.name,
        role: body.role,
        cooperativeId: body.cooperativeId,
        farmId: body.farmId,
        phone: body.phone,
      });
      return Response.json(result, { status: result.success ? 201 : 400 });
    }

    if (action === "refresh") {
      const refreshToken = body.refreshToken || cookieStore.get("refresh_token")?.value;
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
      const phone = normalizePhone(body.phone ?? "");
      if (phone.length < 9) {
        return Response.json(
          { success: false, error: "Inserisci un numero di telefono valido." },
          { status: 400 }
        );
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      const challenge = jwt.sign({ phone, code, type: "otp" }, JWT_SECRET, {
        expiresIn: "5m",
      });
      cookieStore.set(OTP_COOKIE, challenge, sessionCookieOptions(60 * 5));

      return Response.json({
        success: true,
        message: "Codice inviato via SMS demo. Inseriscilo entro 5 minuti.",
        devCode: IS_PRODUCTION ? undefined : code,
      });
    }

    if (action === "verify-otp") {
      const phone = normalizePhone(body.phone ?? "");
      const code = String(body.code ?? "").trim();
      const challenge = cookieStore.get(OTP_COOKIE)?.value;

      if (!phone || !code || !challenge) {
        return Response.json(
          { success: false, error: "Richiedi un codice OTP prima di verificare l'accesso." },
          { status: 400 }
        );
      }

      try {
        const decoded = jwt.verify(challenge, JWT_SECRET) as { phone: string; code: string; type?: string };
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

    if (!body.email || !body.password) {
      return Response.json(
        { success: false, error: "Email e password sono obbligatori." },
        { status: 400 }
      );
    }

    const result = await authenticateUser(body.email, body.password);
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
