import { getLinkPreview } from "link-preview-js";
import Parser from "rss-parser";

import { prisma } from "@/lib/prisma";

export const fetchFeeds = async () => {
  console.log("Fetching items from RSS feeds");

  const channels = await prisma.channel.findMany({
    select: { feedLink: true, id: true, link: true },
  });

  const parser = new Parser({
    customFields: {
      item: ["description"],
    },
  });

  const feeds = channels.map((channel) => parser.parseURL(channel.feedLink));

  Promise.all(feeds).then((responses) => {
    const keywords = ["Trump", "Donald Trump", "Musk", "Elon Musk", "Vance"];

    responses.forEach((response) => {
      const channel = channels.find(
        (channel) => (channel.link ?? "") === response.link
      );

      let filtered = response.items.filter(
        (item) => !keywords.some((keyword) => item.title?.includes(keyword))
      );

      if (response.link?.includes("tweakers")) {
        console.log("TWEAKERS");
        filtered = filtered.filter((item) => item.link?.includes("nieuws"));
      }

      filtered.forEach(async (item) => {
        const data = await getLinkPreview(item.link || "");

        let imageUrl = null;

        if ("images" in data) {
          imageUrl = data.images.pop();
        }

        await prisma.item.upsert({
          where: {
            guid: item.guid,
          },
          update: {
            title: item.title,
            description: item.description,
            link: item.link,
            pubDate: new Date(item.pubDate ?? ""),
            channel: { connect: channel },
            imageUrl: imageUrl,
          },
          create: {
            guid: item.guid ?? "",
            title: item.title ?? "",
            description: item.description,
            link: item.link ?? "",
            pubDate: new Date(item.pubDate ?? ""),
            channel: { connect: channel },
            imageUrl: imageUrl,
          },
        });
      });
    });
  });
}
