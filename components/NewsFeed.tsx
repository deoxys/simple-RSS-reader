"use client"

import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useState } from "react"
import { useIntersectionObserver } from 'usehooks-ts'

import { Keyword, KeywordType } from "@/.prisma/client"
import { getFeedItems, getKeywords } from "@/app/actions"
import ColumnSelector from "@/components/ColumnSelector"
import NewsCard from "@/components/NewsCard"

import { AutoRefreshComponent } from "./AutoRefreshComponent"

export interface FilterSettings {
  titleKeywords: Keyword[];
  contentKeywords: Keyword[];
  categoryKeywords: Keyword[];
}

const defaultFilterSettings: FilterSettings = {
  titleKeywords: [],
  contentKeywords: [],
  categoryKeywords: [],
}

export default function NewsFeed() {
  const [columns, setColumns] = useState(3)
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(
    defaultFilterSettings
  )

  const {data, error, isLoading, refetch, isSuccess, hasNextPage, fetchNextPage, isFetchingNextPage} = useInfiniteQuery({
    queryKey: ["newsItems", filterSettings], 
    queryFn: async ({pageParam}) => await getFeedItems(filterSettings, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPageParam,
    initialPageParam: "",
  })

  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0.5,
  })

  useEffect(() => {
    // Load column preference from localStorage
    const savedColumns = localStorage.getItem("newsColumns")
    if (savedColumns) {
      setColumns(Number.parseInt(savedColumns))
    }

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

        setFilterSettings({ titleKeywords, contentKeywords, categoryKeywords })
      }
    }

    fetchKeywords()
  }, [])

  useEffect(() => {
    if (isIntersecting && !isLoading) {
      fetchNextPage()
    }
  }, [isIntersecting, isLoading, fetchNextPage])

  const handleColumnChange = (newColumns: number) => {
    setColumns(newColumns)
    localStorage.setItem("newsColumns", newColumns.toString())
  }

  // Define grid column classes based on the selected number of columns
  const gridColumnClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columns]

  if (isLoading) {
    return <div>Loading news feeds...</div>
  }

  if (!isSuccess) {
    return <div>{ error?.message }</div>
  }

  if (data.pages.length === 0) {
    return (
      <div className="justify-center items-center flex grow">
        <div className="prose">
          <h3>No news items have been found</h3>
          <p>
            Either the news feeds have not been fetched yet, the filtering with
            the kewords gives no results, or there are no news feeds saved yet.
          </p>
        </div>
      </div>
    )
  }

  const refreshCallback = async () => {
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Latest News</h2>
        <ColumnSelector
          currentColumns={columns}
          onColumnChange={handleColumnChange}
        />
      </div>
      <AutoRefreshComponent refreshCallback={(refreshCallback)} />
      <div
        className={`grid ${gridColumnClass} gap-6 place-items-center mx-auto`}
        style={{ maxWidth: columns <= 2 ? `${32*columns}rem` : "100%" }}
      >
        {data.pages.map((page) =>
          page.items.map((item) => 
            {
              return <NewsCard key={item.guid} item={item} />
            }
          
        ))}
        {hasNextPage ? <div key="next" ref={ref} /> : null}
        {isFetchingNextPage ? <div>Loading...</div> : null}
      </div>
    </div>
  )
}
