import {
  authenticateUser,
  getUserFromRequest,
  refreshAccessToken,
  registerUser,
} from "@/lib/auth-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action ?? "login";

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
      if (!body.refreshToken) {
        return Response.json(
          { success: false, error: "Token di refresh mancante." },
          { status: 400 }
        );
      }
      const result = await refreshAccessToken(body.refreshToken);
      return Response.json(result, { status: result.success ? 200 : 401 });
    }

    // Default: login
    if (!body.email || !body.password) {
      return Response.json(
        { success: false, error: "Email e password sono obbligatori." },
        { status: 400 }
      );
    }

    const result = await authenticateUser(body.email, body.password);
    if (result.success) {
      return Response.json({
        success: true,
        user: result.user,
        token: result.tokens.accessToken,
        tokens: result.tokens,
      });
    }
    return Response.json(result, { status: 401 });
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
