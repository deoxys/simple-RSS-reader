"use client"

import { Channel } from "@prisma/client"
import { Plus, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card"
import { Input } from "../ui/input"

import { addFeed, getFeeds, removeFeed } from "@/app/actions"
import { fetchFeeds } from "@/server/scheduler/jobs/fetchFeeds"

export default function FeedSettings() {
  const [feedURL, setFeedURL] = useState("")

  const [feeds, setFeeds] = useState<Channel[]>([])

  useEffect(() => {
    const fetchFeedsFromDB = async () => {
      const feeds = await getFeeds()
      if (feeds.length > 0) {
        setFeeds(feeds)
      }
    }

    fetchFeedsFromDB()
  }, [])

  const addNewFeed = async () => {
    if (!feedURL.trim()) return

    const feed = await addFeed(feedURL)

    setFeedURL("")

    setFeeds((prev) => [...prev, feed])

    fetchFeeds()

    toast.message("Feed added", {
      description: `${feed.title} has been successfully added to the feed list.`,
    })
  }

  const deleteFeed = async (feedId: number) => {
    const feed = await removeFeed(feedId)

    setFeeds((prev) => prev.filter((f) => f.id !== feedId))

    toast.message("Feed removed", {
      description: `Removed ${feed.title} from feeds`,
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Feeds</CardTitle>
          <CardDescription>Add feeds to fetch news from.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="RSS URL"
              value={feedURL}
              onChange={(e) => setFeedURL(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNewFeed()}
              className="flex-1"
            />
            <Button onClick={addNewFeed}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {feeds.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No feeds have been added yet.
              </p>
            ) : (
              feeds.map((feed) => (
                <Badge key={feed.id} variant="secondary" className="px-3 py-1">
                  {feed.title}
                  <button
                    onClick={() => deleteFeed(feed.id)}
                    className="ml-2 hover:text-destructive"
                    aria-label={`Remove ${feed.title} feed`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}