import { NextResponse } from "next/server";

import { fetchFeeds } from "@/server/scheduler/jobs/fetchFeeds";

export async function GET() {
  await fetchFeeds()

  return NextResponse.json({
    status: "success",
    message: "Feeds have been updated",
  });
}
