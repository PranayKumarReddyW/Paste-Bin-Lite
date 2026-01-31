import { NextRequest, NextResponse } from "next/server";
import { getPaste } from "@/lib/paste";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const testNowMs = request.headers.get("x-test-now-ms");
    const paste = await getPaste(id, true, testNowMs || undefined);

    if (!paste) {
      return NextResponse.json(
        { error: "Paste not found" },
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return NextResponse.json(
      {
        content: paste.content,
        remaining_views: paste.remainingViews,
        expires_at: paste.expiresAt,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching paste:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
