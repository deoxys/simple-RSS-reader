import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import FilterSettings from "@/components/FilterSettings"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to News
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Feed Settings</h1>
      </div>
      <div></div>
      <Suspense fallback={<div>Loading settings...</div>}>
        <FilterSettings />
      </Suspense>
    </main>
  )
}
