import { getMoonshotPortfolio } from "@/lib/moonshot-operating-system";

export async function GET() {
  return Response.json(getMoonshotPortfolio());
}
