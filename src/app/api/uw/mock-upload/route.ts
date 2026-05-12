import { NextResponse } from "next/server";

// Dev-only sink. The real route is presigned S3 uploads.
// Accepts any PUT, ignores the body, returns 200. Keys are still tracked in
// the DB so we can swap to S3 later by setting AWS_* env vars.
export async function PUT(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Configure S3 in production" }, { status: 501 });
  }
  await req.arrayBuffer();
  return new NextResponse(null, { status: 200 });
}
