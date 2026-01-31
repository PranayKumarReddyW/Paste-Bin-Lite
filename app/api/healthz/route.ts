import { NextResponse } from "next/server";
import { checkRedisHealth } from "@/lib/redis";

export async function GET() {
  try {
    const isHealthy = await checkRedisHealth();

    return NextResponse.json(
      { ok: isHealthy },
      {
        status: isHealthy ? 200 : 503,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false },
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
