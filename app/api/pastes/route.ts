import { NextRequest, NextResponse } from "next/server";
import { createPaste, validatePasteData } from "@/lib/paste";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = validatePasteData({
      content: body.content,
      ttlSeconds: body.ttl_seconds,
      maxViews: body.max_views,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const result = await createPaste({
      content: body.content,
      ttlSeconds: body.ttl_seconds,
      maxViews: body.max_views,
    });

    return NextResponse.json(result, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating paste:", error);
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
