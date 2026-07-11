import { setCsrfToken } from "@/lib/csrf";

export async function GET() {
  const token = await setCsrfToken();
  return Response.json({ token });
}
