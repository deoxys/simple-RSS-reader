"use server"

import { Channel, Item, KeywordType } from "@prisma/client"
import { getLinkPreview } from "link-preview-js"
import Parser from "rss-parser"

import { FilterSettings } from "@/components/NewsFeed"
import { prisma } from "@/lib/prisma"
import { parseHtmlEntities } from "@/lib/utils"

// Custom parser type to handle different RSS formats
type CustomItem = {
  title: string;
  link: string;
  content: string;
  contentSnippet?: string;
  description?: string;
  category?: string;
  pubDate: string;
  isoDate?: string;
  "media:content"?: {
    $: {
      url: string;
    };
  };
  enclosure?: {
    url: string;
  };
  "content:encoded"?: string;
  summary?: string;
  guid?: string;
};

export async function fetchRssFeeds() {
  const parser = new Parser<{ items: CustomItem[] }>({
    customFields: {
      item: [
        ["media:content", "media:content"],
        ["content:encoded", "content:encoded"],
        ["summary", "summary"],
        ["guid", "guid"],
        ["category", "category"],
      ],
    },
  })

  const channels = (await prisma.channel.findMany()) ?? []

  try {
    // Fetch and parse each RSS feed
    for (const channel of channels) {
      try {
        const feedUrl = channel.feedLink
        if (!feedUrl) {
          console.error(`No URL defined for feed: ${channel.title}`)
          continue
        }

        console.log(`Fetching ${channel.title} from ${feedUrl}...`)
        const response = await fetch(feedUrl, {
          next: { revalidate: 0 }, // Disable cache for debugging
          cache: "no-store",
        })

        if (!response.ok) {
          console.error(
            `Failed to fetch ${channel.title}: ${response.status} ${response.statusText}`
          )
          continue
        }

        const xml = await response.text()
        console.log(`Parsing ${channel.title} XML...`)
        const parsedFeed = await parser.parseString(xml)
        console.log(
          `Found ${parsedFeed.items.length} items in ${channel.title}`
        )

        // Process each item in the feed
        parsedFeed.items.forEach(async (item) => {
          try {
            // Extract image URL from various possible locations in the feed
            let imageUrl = undefined
            let imageTitle = undefined
            // Safely check for media:content
            if (item["media:content"]) {
              // Handle both array and object formats
              if (Array.isArray(item["media:content"])) {
                // Some feeds provide media:content as an array
                const mediaContent = item["media:content"][0]
                imageUrl =
                  mediaContent && mediaContent.$
                    ? mediaContent.$.url
                    : undefined
              } else if (
                item["media:content"].$ &&
                item["media:content"].$.url
              ) {
                // Direct object format
                imageUrl = item["media:content"].$.url
              }
            } else if (item.enclosure?.url) {
              imageUrl = item.enclosure.url
            } else {
              // Try to extract image from content
              const imgMatch = (item.content || item.description || "").match(
                /<img[^>]+src="(?<src>[^">]+)"([^>]+title="(?<title>[^">]+)")*([^>]+alt="(?<alt>[^">]+)")*/i
              )

              const overwriteContentWithTitle = (
                item.content ||
                item.description ||
                ""
              ).match(/^<img[^>]+>$/)

              if (imgMatch && imgMatch.groups?.src) {
                imageUrl = imgMatch.groups.src
              }

              if (
                imgMatch &&
                imgMatch.groups?.title &&
                overwriteContentWithTitle
              ) {
                imageTitle = imgMatch.groups.title
              }
            }
            if (!imageUrl) {
              const data = await getLinkPreview(item.link)
              if ("images" in data) {
                imageUrl = data.images.pop()
              }
            }

            await prisma.item.upsert({
              where: {
                guid: item.guid,
              },
              update: {
                title: parseHtmlEntities(item.title) || "Untitled",
                description:
                  imageTitle ||
                  item.content ||
                  item["content:encoded"] ||
                  item.contentSnippet ||
                  item.description ||
                  "",
                link: item.link || "#",
                category: item.category,
                pubDate: new Date(item.pubDate ?? ""),
                channel: { connect: channel },
                imageUrl: imageUrl,
              },
              create: {
                guid: item.guid ?? "",
                title: item.title ?? "",
                description:
                  imageTitle ||
                  item.content ||
                  item["content:encoded"] ||
                  item.contentSnippet ||
                  item.description ||
                  "",
                link: item.link ?? "",
                category: item.category,
                pubDate: new Date(item.pubDate ?? ""),
                channel: { connect: channel },
                imageUrl: imageUrl,
              },
            })
          } catch (itemError) {
            console.error(
              `Error processing item from ${channel.title}:`,
              itemError
            )
            return null
          }
        })
      } catch (error) {
        console.error(`Error fetching ${channel.title}:`, error)
      }
    }
  } catch (error) {
    console.error("Error fetching RSS feeds:", error)
  }
}

export async function getKeywords() {
  return await prisma.keyword.findMany()
}

export async function saveKeyword(keyword: string, type: KeywordType) {
  return await prisma.keyword.create({
    data: {
      type: type,
      value: keyword,
    },
  })
}

export async function removeKeyword(id: number) {
  return await prisma.keyword.delete({ where: { id: id } })
}

export async function addFeed(feedURL: string) {
  const parser = new Parser({
    customFields: {
      feed: ["language"],
    },
  })

  const response = await fetch(feedURL, {
    next: { revalidate: 0 }, // Disable cache for debugging
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${name}: ${response.status} ${response.statusText}`
    )
  }

  const xml = await response.text()
   const parsedFeed = await parser.parseString(xml)

  const feed = await prisma.channel.upsert({
    where: {
      feedLink: feedURL,
    },
    update: {
      title: parsedFeed.title,
      description: parsedFeed.description,
      link: parsedFeed.link,
      language: parsedFeed.language ?? "",
      feedLink: feedURL,
    },
    create: {
      title: parsedFeed.title ?? "",
      description: parsedFeed.description ?? "",
      link: parsedFeed.link ?? "",
      language: parsedFeed.language ?? "",
      feedLink: feedURL,
    },
  })

  return feed
}

export async function removeFeed(id: number) {
  return await prisma.channel.delete({
    where: {
      id,
    },
  })
}

export async function getFeeds() {
  return await prisma.channel.findMany()
}

export async function getFeedItems(
  filter: FilterSettings,
  cursor?: string | null,
  pageSize: number = 25,

): Promise<{
  items: (Item & { channel: Channel | null })[],
  nextPageParam: string | null,
  hasNextPage: boolean,
}> {

  let pagination = {}

  if (cursor) {
    pagination = {
      skip: 1,
      cursor: {guid: cursor},
    }
  }

  const items = await prisma.item.findMany({
    ...pagination,
    take: pageSize,
    where: {
      AND: [
        {
          NOT: filter.titleKeywords.map((keyword) => ({
            title: { contains: keyword.value, mode: "insensitive" },
          })),
        },
        {
          NOT: filter.contentKeywords.map((keyword) => ({
            description: { contains: keyword.value, mode: "insensitive" },
          })),
        },
        {
          OR: [
            {
              NOT: filter.categoryKeywords.map((keyword) => ({
                category: { contains: keyword.value, mode: "insensitive" },
              })),
            },
            {
              category: null,
            },
          ],
        },
      ],
    },
    include: {
      channel: true,
    },
    orderBy: {
      pubDate: "desc",
    },
  })

  const hasNextPage = items.length === pageSize
    
  return { 
    items: items,
    hasNextPage: hasNextPage,
    nextPageParam: hasNextPage ? items[pageSize-1].guid : null,
  }
}
