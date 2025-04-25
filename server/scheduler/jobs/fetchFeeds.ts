export const fetchFeeds = async () => {
  console.log("Fetching items from RSS feeds")
  fetch("http://localhost:3000/fetchFeeds")
}
