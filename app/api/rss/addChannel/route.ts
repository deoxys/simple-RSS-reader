import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";

export async function POST(request: NextRequest) {
  const { feedLink } = await request.json();

  if (feedLink === null || feedLink === undefined) {
    return NextResponse.json({
      status: "failed",
      message: "Invalid postdata send",
    });
  }

  const response = await fetch(feedLink);

  if (response.headers.get("content-type")?.includes("text/xml")) {
    const parser = new Parser({
      customFields: {
        feed: ["language"],
      },
    });
    const json = await parser.parseString(await response.text());
    const channel = await prisma.channel.upsert({
      where: {
        feedLink: feedLink,
      },
      update: {
        title: json.title,
        description: json.description,
        link: json.link,
        language: json.language ?? "",
        feedLink: feedLink,
      },
      create: {
        title: json.title ?? "",
        description: json.description ?? "",
        link: json.link ?? "",
        language: json.language ?? "",
        feedLink: feedLink,
      },
    });

    return NextResponse.json({
      status: "success",
      message: `channel "${channel.title}" added`,
    });
  }

  return NextResponse.json({
    status: "failed",
    message: "unexpected data type recieved from feedLink",
  });
}
