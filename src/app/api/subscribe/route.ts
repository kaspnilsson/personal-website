import { NextRequest, NextResponse } from "next/server";

const LOOPS_API_URL = "https://app.loops.so/api/v1/contacts/create";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LOOPS_API_KEY;
    
    if (!apiKey) {
      console.error("LOOPS_API_KEY environment variable is not set");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    const response = await fetch(LOOPS_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        source: "kasp.io website",
        subscribed: true,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return NextResponse.json({ success: true });
    }

    if (response.status === 409) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: data.message || "Failed to subscribe" },
      { status: response.status }
    );
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
