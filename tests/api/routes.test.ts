import { describe, it, expect, vi } from "vitest";

// Mock next/headers (cookies) which is not available in unit tests
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: () => undefined,
    set: () => {},
    delete: () => {},
  }),
}));

// Mock getUserFromRequest to return a user with correct RBAC role
const mockUser = {
  id: "user-tondini",
  email: "marco@tondini.farm",
  name: "Marco Tondini",
  role: "cooperative_admin",
  cooperativeId: "coop-romagna-unita",
  farmId: "azienda-tondini",
  phone: "+39 347 123 4567",
  avatarInitials: "MT",
};

vi.mock("@/lib/auth-service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth-service")>();
  return {
    ...actual,
    getUserFromRequest: vi.fn(async (request: Request) => {
      const authHeader = request.headers.get("Authorization");
      if (authHeader === "Bearer test-valid-token") {
        return mockUser;
      }
      return null;
    }),
  };
});

function authedRequest(url: string, options?: RequestInit): Request {
  return new Request(url, {
    ...options,
    headers: {
      Authorization: "Bearer test-valid-token",
      ...(options?.headers ?? {}),
    },
  });
}

function unauthRequest(url: string, options?: RequestInit): Request {
  return new Request(url, options);
}

describe("API /api/health", () => {
  it("GET returns 200 with health status", async () => {
    const { GET } = await import("@/app/api/health/route");
    const request = unauthRequest("http://localhost:3000/api/health");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("status");
  });

  it("GET ?probe=liveness returns alive flag", async () => {
    const { GET } = await import("@/app/api/health/route");
    const request = unauthRequest("http://localhost:3000/api/health?probe=liveness");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("alive", true);
  });
});

describe("API /api/auth", () => {
  it("POST login with invalid credentials returns 401", async () => {
    const { POST } = await import("@/app/api/auth/route");
    const request = new Request("http://localhost:3000/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        email: "nobody@example.com",
        password: "wrongpassword",
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it("POST login with missing fields returns 400", async () => {
    const { POST } = await import("@/app/api/auth/route");
    const request = new Request("http://localhost:3000/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("GET /api/auth with valid token returns user", async () => {
    const { GET } = await import("@/app/api/auth/route");
    const request = authedRequest("http://localhost:3000/api/auth");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.user).toHaveProperty("email", "marco@tondini.farm");
  });

  it("GET /api/auth without token returns 401", async () => {
    const { GET } = await import("@/app/api/auth/route");
    const request = unauthRequest("http://localhost:3000/api/auth");
    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});

describe("API /api/fields", () => {
  it("GET returns 401 without auth", async () => {
    const { GET } = await import("@/app/api/fields/route");
    const request = unauthRequest("http://localhost:3000/api/fields");
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("GET returns fields data with valid auth", async () => {
    const { GET } = await import("@/app/api/fields/route");
    const request = authedRequest("http://localhost:3000/api/fields");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("data");
    expect(body.data).toHaveProperty("fields");
    expect(body.data).toHaveProperty("summary");
    expect(body).toHaveProperty("meta");
  });

  it("POST without required fields returns 400", async () => {
    const { POST } = await import("@/app/api/fields/route");
    const request = authedRequest("http://localhost:3000/api/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("DELETE without id returns 400", async () => {
    const { DELETE } = await import("@/app/api/fields/route");
    const request = authedRequest("http://localhost:3000/api/fields");
    const response = await DELETE(request);
    expect(response.status).toBe(400);
  });
});

describe("API /api/sync", () => {
  it("POST rejects GET method in mutations", async () => {
    const { POST } = await import("@/app/api/sync/route");
    const request = authedRequest("http://localhost:3000/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mutations: [
          { url: "/api/fields", method: "GET", body: "{}", timestamp: Date.now() },
        ],
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.failed).toBe(1);
    expect(body.data.results[0].error).toContain("GET");
  });

  it("POST rejects disallowed URLs", async () => {
    const { POST } = await import("@/app/api/sync/route");
    const request = authedRequest("http://localhost:3000/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mutations: [
          { url: "/api/admin/users", method: "POST", body: "{}", timestamp: Date.now() },
        ],
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.failed).toBe(1);
    expect(body.data.results[0].error).toContain("URL non consentito");
  });

  it("POST accepts allowed methods on allowed paths", async () => {
    // The inner fetch will fail (no server running), but it should pass URL+method validation
    const { POST } = await import("@/app/api/sync/route");
    const request = authedRequest("http://localhost:3000/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mutations: [
          { url: "/api/fields", method: "POST", body: JSON.stringify({ name: "test" }), timestamp: Date.now() },
        ],
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    // The mutation should pass validation (method + URL) even if the inner fetch fails
    expect(body.data.processed).toBe(1);
  });
});

describe("API /api/actions", () => {
  it("GET returns 401 without auth", async () => {
    const { GET } = await import("@/app/api/actions/route");
    const request = unauthRequest("http://localhost:3000/api/actions");
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("GET returns actions list with valid auth", async () => {
    const { GET } = await import("@/app/api/actions/route");
    const request = authedRequest("http://localhost:3000/api/actions");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("POST creates an action with valid payload", async () => {
    const { POST } = await import("@/app/api/actions/route");
    const request = authedRequest("http://localhost:3000/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow: "irrigazione",
        recommendedDay: "2026-05-15",
        recommendation: "Irrigare campo nord",
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.data).toHaveProperty("id");
    expect(body.data.workflow).toBe("irrigazione");
    expect(body.data.status).toBe("confermata");
  });

  it("POST returns 400 when workflow is missing", async () => {
    const { POST } = await import("@/app/api/actions/route");
    const request = authedRequest("http://localhost:3000/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recommendedDay: "2026-05-15",
        recommendation: "Irrigare campo nord",
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("POST returns 400 when recommendedDay is missing", async () => {
    const { POST } = await import("@/app/api/actions/route");
    const request = authedRequest("http://localhost:3000/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow: "irrigazione",
        recommendation: "Irrigare campo nord",
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("POST returns 400 for empty body", async () => {
    const { POST } = await import("@/app/api/actions/route");
    const request = authedRequest("http://localhost:3000/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("POST returns 400 for invalid JSON", async () => {
    const { POST } = await import("@/app/api/actions/route");
    const request = authedRequest("http://localhost:3000/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("POST returns 401 without auth", async () => {
    const { POST } = await import("@/app/api/actions/route");
    const request = unauthRequest("http://localhost:3000/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow: "irrigazione",
        recommendedDay: "2026-05-15",
        recommendation: "Irrigare campo nord",
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("POST with scheduledDate creates action with pianificata status", async () => {
    const { POST } = await import("@/app/api/actions/route");
    const request = authedRequest("http://localhost:3000/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow: "trattamento-fitosanitario",
        recommendedDay: "2026-05-20",
        recommendation: "Trattamento preventivo",
        scheduledDate: "2026-05-22",
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.data.status).toBe("pianificata");
    expect(body.data.scheduledDate).toBe("2026-05-22");
  });
});
