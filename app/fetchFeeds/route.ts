import { fetchRssFeeds } from "../actions"

export async function GET() {
    await fetchRssFeeds()
    return Response.json(
        { status: "success", message: "Feeds have been fetched and updated" }
    )
}

