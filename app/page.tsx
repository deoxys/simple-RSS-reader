import { Settings } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import NewsFeed from "@/components/NewsFeed";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <main className="container flex flex-col mx-auto py-8 px-4 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">RSS News Feed</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </div>
      <Suspense fallback={<NewsFeedSkeleton />}>
        <NewsFeed />
      </Suspense>
    </main>
  );
}

function NewsFeedSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div className="p-6 space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
