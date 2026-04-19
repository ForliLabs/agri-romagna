import { authenticateUser, getUserByToken, type LoginRequest } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as LoginRequest;

  if (!body.email || !body.password) {
    return Response.json(
      { success: false, error: "Email e password sono obbligatori." },
      { status: 400 }
    );
  }

  const result = authenticateUser(body.email, body.password);
  return Response.json(result, { status: result.success ? 200 : 401 });
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return Response.json(
      { success: false, error: "Token mancante." },
      { status: 401 }
    );
  }

  const user = getUserByToken(token);
  if (!user) {
    return Response.json(
      { success: false, error: "Token non valido." },
      { status: 401 }
    );
  }

  return Response.json({ success: true, user });
}
