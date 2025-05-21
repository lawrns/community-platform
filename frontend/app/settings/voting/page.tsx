"use client"

import { PageTitle } from "@/components/ui/page-title"
import { VoteCreditsCard } from "@/components/voting/VoteCreditsCard"
import { Separator } from "@/components/ui/separator"

export default function VotingSettingsPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <PageTitle
        title="Voting Power"
        description="Manage your quadratic voting credits and view your voting history"
      />
      
      <Separator className="mb-8" />
      
      <div className="grid gap-8">
        <VoteCreditsCard />
      </div>
    </div>
  )
}