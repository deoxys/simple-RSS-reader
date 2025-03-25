"use client"

import { Channel, Keyword, KeywordType } from "@prisma/client"
import { X, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

import {
  addFeed,
  getFeeds,
  getKeywords,
  removeFeed,
  removeKeyword,
  saveKeyword,
} from "@/app/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { fetchFeeds } from "@/server/scheduler/jobs/fetchFeeds"

interface FilterSettings {
  titleKeywords: Keyword[];
  contentKeywords: Keyword[];
  categoryKeywords: Keyword[];
}

const defaultSettings: FilterSettings = {
  titleKeywords: [],
  contentKeywords: [],
  categoryKeywords: [],
}

export default function FilterSettings() {
  const [settings, setSettings] = useState<FilterSettings>(defaultSettings)

  const [newTitleKeyword, setNewTitleKeyword] = useState("")
  const [newContentKeyword, setNewContentKeyword] = useState("")
  const [newCategoryKeyword, setNewCategoryKeyword] = useState("")

  const [feedURL, setFeedURL] = useState("")

  const [feeds, setFeeds] = useState<Channel[]>([])

  // Load settings from db on component mount
  useEffect(() => {
    const fetchKeywords = async () => {
      const keywords = await getKeywords()
      if (keywords.length > 0) {
        const titleKeywords = keywords.filter(
          (item) => item.type === KeywordType.Title
        )
        const contentKeywords = keywords.filter(
          (item) => item.type === KeywordType.Content
        )
        const categoryKeywords = keywords.filter(
          (item) => item.type === KeywordType.Category
        )

        setSettings({ titleKeywords, contentKeywords, categoryKeywords })
      }
    }

    const fetchFeeds = async () => {
      const feeds = await getFeeds()
      if (feeds.length > 0) {
        setFeeds(feeds)
      }
    }

    fetchKeywords()
    fetchFeeds()
  }, [])

  const addTitleKeyword = async () => {
    if (!newTitleKeyword.trim()) return

    // Check if keyword already exists
    if (
      settings.titleKeywords.some(
        (item) => item.value === newTitleKeyword.trim().toLowerCase()
      )
    ) {
      toast.error("Keyword already exists", {
        description: `"${newTitleKeyword}" is already in your title filters.`,
      })
      return
    }

    const keyword = await saveKeyword(
      newTitleKeyword.trim().toLowerCase(),
      KeywordType.Title
    )

    setSettings((prev) => ({
      ...prev,
      titleKeywords: [...prev.titleKeywords, keyword],
    }))
    setNewTitleKeyword("")

    toast.message("Title filter added", {
      description: `Articles with "${newTitleKeyword}" in the title will now be hidden.`,
    })
  }

  const removeTitleKeyword = async (keywordId: number) => {
    setSettings((prev) => ({
      ...prev,
      titleKeywords: prev.titleKeywords.filter((k) => k.id !== keywordId),
    }))

    const keyword = await removeKeyword(keywordId)

    toast.success("Title filter removed", {
      description: `Removed "${keyword.value}" from title filters.`,
    })
  }

  const addContentKeyword = async () => {
    if (!newContentKeyword.trim()) return

    // Check if keyword already exists
    if (
      settings.contentKeywords.some(
        (item) => item.value === newContentKeyword.trim().toLowerCase()
      )
    ) {
      toast.error("Keyword already exists", {
        description: `"${newContentKeyword}" is already in your content filters.`,
      })
      return
    }

    const keyword = await saveKeyword(
      newContentKeyword.trim().toLowerCase(),
      KeywordType.Content
    )

    setSettings((prev) => ({
      ...prev,
      contentKeywords: [...prev.contentKeywords, keyword],
    }))
    setNewContentKeyword("")

    toast.message("Content filter added", {
      description: `Articles with "${newContentKeyword}" in the content will now be hidden.`,
    })
  }

  const removeContentKeyword = async (keywordId: number) => {
    setSettings((prev) => ({
      ...prev,
      contentKeywords: prev.contentKeywords.filter((k) => k.id !== keywordId),
    }))

    const keyword = await removeKeyword(keywordId)

    toast.message("Content filter removed", {
      description: `Removed "${keyword.value}" from content filters.`,
    })
  }

  const addCategoryKeyword = async () => {
    if (!newCategoryKeyword.trim()) return

    // Check if keyword already exists
    if (
      settings.categoryKeywords.some(
        (item) => item.value === newCategoryKeyword.trim().toLowerCase()
      )
    ) {
      toast.error("Keyword already exists", {
        description: `"${newCategoryKeyword}" is already in your category filters.`,
      })
      return
    }

    const keyword = await saveKeyword(
      newCategoryKeyword.trim().toLowerCase(),
      KeywordType.Category
    )

    setSettings((prev) => ({
      ...prev,
      categoryKeywords: [...prev.categoryKeywords, keyword],
    }))
    setNewCategoryKeyword("")

    toast.message("Cateogry filter added", {
      description: `Articles with "${newCategoryKeyword}" in the category will now be hidden.`,
    })
  }

  const removeCategoryKeyword = async (keywordId: number) => {
    setSettings((prev) => ({
      ...prev,
      categoryKeywords: prev.categoryKeywords.filter((k) => k.id !== keywordId),
    }))

    const keyword = await removeKeyword(keywordId)

    toast.success("Category filter removed", {
      description: `Removed "${keyword.value}" from category filters.`,
    })
  }

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
          <CardTitle>Title Filters</CardTitle>
          <CardDescription>
            Add keywords to filter articles by their titles. Articles matching
            these keywords will be hidden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Add a keyword..."
              value={newTitleKeyword}
              onChange={(e) => setNewTitleKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTitleKeyword()}
              className="flex-1"
            />
            <Button onClick={addTitleKeyword}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.titleKeywords.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No title filters added yet.
              </p>
            ) : (
              settings.titleKeywords.map((keyword) => (
                <Badge
                  key={keyword.value}
                  variant="secondary"
                  className="px-3 py-1"
                >
                  {keyword.value}
                  <button
                    onClick={() => removeTitleKeyword(keyword.id)}
                    className="ml-2 hover:text-destructive"
                    aria-label={`Remove ${keyword} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Filters</CardTitle>
          <CardDescription>
            Add keywords to filter articles by their content. Articles matching
            these keywords will be hidden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Add a keyword..."
              value={newContentKeyword}
              onChange={(e) => setNewContentKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addContentKeyword()}
              className="flex-1"
            />
            <Button onClick={addContentKeyword}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.contentKeywords.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No content filters added yet.
              </p>
            ) : (
              settings.contentKeywords.map((keyword) => (
                <Badge
                  key={keyword.value}
                  variant="secondary"
                  className="px-3 py-1"
                >
                  {keyword.value}
                  <button
                    onClick={() => removeContentKeyword(keyword.id)}
                    className="ml-2 hover:text-destructive"
                    aria-label={`Remove ${keyword} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Article Category Filters</CardTitle>
          <CardDescription>
            Add keywords to filter articles by their category. Article
            categories matching these keywords will be hidden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Add a keyword..."
              value={newCategoryKeyword}
              onChange={(e) => setNewCategoryKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategoryKeyword()}
              className="flex-1"
            />
            <Button onClick={addCategoryKeyword}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.categoryKeywords.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No category filters added yet.
              </p>
            ) : (
              settings.categoryKeywords.map((keyword) => (
                <Badge
                  key={keyword.value}
                  variant="secondary"
                  className="px-3 py-1"
                >
                  {keyword.value}
                  <button
                    onClick={() => removeCategoryKeyword(keyword.id)}
                    className="ml-2 hover:text-destructive"
                    aria-label={`Remove ${keyword} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Feeds</CardTitle>
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
