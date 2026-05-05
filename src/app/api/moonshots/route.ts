import { getMoonshotPortfolio } from "@/lib/moonshot-operating-system";
import { authorizeRoute } from "@/lib/api-response";

export async function GET(request: Request) {
  const { denied } = await authorizeRoute(request, "dashboard:view");
  if (denied) return denied;

  return Response.json(getMoonshotPortfolio());
}
