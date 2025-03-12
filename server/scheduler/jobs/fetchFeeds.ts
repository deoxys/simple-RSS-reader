import { fetchRssFeeds } from "@/app/actions";

export const fetchFeeds = async () => {
  console.log("Fetching items from RSS feeds");
  fetchRssFeeds();
};
