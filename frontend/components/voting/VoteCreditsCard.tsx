'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Coins, Clock, ArrowUpDown, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/components/auth/AuthContext'
import { formatDistanceToNow } from 'date-fns'

export function VoteCreditsCard() {
  const [creditInfo, setCreditInfo] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [activeVotes, setActiveVotes] = useState<any[]>([])
  const [isLoadingCredits, setIsLoadingCredits] = useState(true)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
  const [isLoadingVotes, setIsLoadingVotes] = useState(true)
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      fetchCreditInfo()
      fetchTransactions()
      fetchActiveVotes()
    }
  }, [isAuthenticated])

  const fetchCreditInfo = async () => {
    try {
      setIsLoadingCredits(true)
      const response = await api.votes.getCredits()
      setCreditInfo(response.credits)
    } catch (error) {
      console.error('Error fetching credit info:', error)
      toast({
        title: 'Error',
        description: 'Failed to load vote credit information',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingCredits(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      setIsLoadingTransactions(true)
      const response = await api.votes.getCreditHistory()
      setTransactions(response.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setIsLoadingTransactions(false)
    }
  }

  const fetchActiveVotes = async () => {
    try {
      setIsLoadingVotes(true)
      const response = await api.votes.getUserVotes()
      setActiveVotes(response.votes || [])
    } catch (error) {
      console.error('Error fetching active votes:', error)
    } finally {
      setIsLoadingVotes(false)
    }
  }

  function getTransactionIcon(reason: string) {
    switch (reason) {
      case 'vote':
        return <ArrowUpDown className="h-4 w-4 text-orange-500" />
      case 'vote_refund':
        return <ArrowUpDown className="h-4 w-4 text-green-500" />
      case 'weekly_refresh':
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      default:
        return <Coins className="h-4 w-4 text-gray-500" />
    }
  }

  function getTransactionDescription(transaction: any) {
    switch (transaction.reason) {
      case 'vote':
        return 'Spent on vote'
      case 'vote_refund':
        return 'Refunded from removed vote'
      case 'weekly_refresh':
        return 'Weekly credit refresh'
      default:
        return transaction.reason.replace(/_/g, ' ')
    }
  }

  function getTargetType(vote: any) {
    if (vote.content_id) return 'content'
    if (vote.tool_id) return 'tool'
    if (vote.review_id) return 'review'
    return 'unknown'
  }

  function getTargetId(vote: any) {
    return vote.content_id || vote.tool_id || vote.review_id
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Coins className="mr-2 h-5 w-5" />
          Vote Credits
        </CardTitle>
        <CardDescription>
          Your voting power and transaction history
        </CardDescription>
      </CardHeader>

      <Tabs defaultValue="credits">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credits">Credits</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="active">Active Votes</TabsTrigger>
        </TabsList>

        <CardContent className="pt-6">
          <TabsContent value="credits">
            {isLoadingCredits ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : creditInfo ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">{creditInfo.available_credits}</div>
                    <div className="text-sm text-muted-foreground mt-1">Available Credits</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">{creditInfo.total_earned_credits}</div>
                    <div className="text-sm text-muted-foreground mt-1">Total Earned</div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div className="text-sm">
                      Last refreshed {creditInfo.last_credit_refresh ? (
                        formatDistanceToNow(new Date(creditInfo.last_credit_refresh), { addSuffix: true })
                      ) : 'never'}
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">About Quadratic Voting</h4>
                  <p className="text-sm text-muted-foreground">
                    Quadratic voting allows you to express the strength of your preferences. 
                    The cost of votes increases quadratically (1 vote = 1 credit, 2 votes = 4 credits, 3 votes = 9 credits),
                    which encourages you to spread your voting power across many items rather than concentrating it on a few.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No credit information available
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions">
            {isLoadingTransactions ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className="bg-background rounded-full p-2 mr-3">
                        {getTransactionIcon(transaction.reason)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {getTransactionDescription(transaction)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${transaction.credits_change > 0 ? 'text-green-500' : 'text-orange-500'}`}>
                      {transaction.credits_change > 0 ? '+' : ''}{transaction.credits_change}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            )}
          </TabsContent>

          <TabsContent value="active">
            {isLoadingVotes ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : activeVotes.length > 0 ? (
              <div className="space-y-3">
                {activeVotes.map((vote) => (
                  <div key={vote.user_id + getTargetType(vote) + getTargetId(vote)} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className={`bg-background rounded-full p-2 mr-3 ${vote.vote_type === 1 ? 'text-green-500' : 'text-orange-500'}`}>
                        {vote.vote_type === 1 ? (
                          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {vote.vote_type === 1 ? 'Upvote' : 'Downvote'} on {getTargetType(vote)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {getTargetId(vote)} · {formatDistanceToNow(new Date(vote.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm font-medium">
                        Weight: {vote.vote_weight}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Cost: {vote.credits_spent} credits
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No active votes
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => {
            fetchCreditInfo()
            fetchTransactions()
            fetchActiveVotes()
            toast({
              title: 'Refreshed',
              description: 'Vote credit information updated'
            })
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  )
}