'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Triangle, ChevronUp, ChevronDown, X, Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/auth/AuthContext'
import { cn } from '@/lib/utils'

interface QuadraticVoteButtonProps {
  targetId: string
  targetType: 'content' | 'tool' | 'review'
  initialVoteWeight?: number
  initialVoteType?: 1 | -1
  allowDownvote?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onVote?: (weight: number, type: 1 | -1, credits: number) => void
  onUnvote?: () => void
}

export default function QuadraticVoteButton({
  targetId,
  targetType,
  initialVoteWeight = 0,
  initialVoteType = 1,
  allowDownvote = true,
  size = 'md',
  className,
  onVote,
  onUnvote
}: QuadraticVoteButtonProps) {
  const [voteWeight, setVoteWeight] = useState(initialVoteWeight)
  const [voteType, setVoteType] = useState<1 | -1>(initialVoteType)
  const [isVoted, setIsVoted] = useState(initialVoteWeight > 0)
  const [isLoading, setIsLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const { theme } = useTheme()

  const calculateCost = (weight: number) => weight * weight

  // Fetch user's available credits
  useEffect(() => {
    if (isAuthenticated && open) {
      fetchCredits()
    }
  }, [isAuthenticated, open])

  // Fetch existing vote if any
  useEffect(() => {
    if (isAuthenticated && targetId) {
      fetchExistingVote()
    }
  }, [isAuthenticated, targetId, targetType])

  const fetchCredits = async () => {
    try {
      const response = await api.votes.getCredits()
      setCredits(response.credits?.available_credits || 0)
    } catch (error) {
      console.error('Error fetching credits:', error)
    }
  }

  const fetchExistingVote = async () => {
    try {
      const response = await api.votes.getVote(targetType, targetId)
      if (response.vote) {
        setVoteWeight(response.vote.vote_weight || 0)
        setVoteType(response.vote.vote_type || 1)
        setIsVoted(true)
      } else {
        setVoteWeight(0)
        setIsVoted(false)
      }
    } catch (error) {
      console.error('Error fetching vote:', error)
    }
  }

  const handleVote = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to vote',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      if (isVoted) {
        // Remove vote
        const response = await api.votes.removeVote(targetType, targetId)
        setVoteWeight(0)
        setIsVoted(false)
        setCredits((prev) => (prev || 0) + (response.credits_refunded || 0))
        
        toast({
          title: 'Vote removed',
          description: `${response.credits_refunded || 0} credits refunded`,
        })
        
        if (onUnvote) onUnvote()
      } else {
        // Cast new vote
        const newWeight = voteWeight || 1 // Default to 1 if not set
        const response = await api.votes.castVote(targetType, targetId, newWeight, voteType)
        
        if (response.success) {
          setVoteWeight(newWeight)
          setIsVoted(true)
          setCredits(response.available_credits || 0)
          
          toast({
            title: 'Vote recorded',
            description: `${response.credits_spent || 0} credits spent`,
          })
          
          if (onVote) onVote(newWeight, voteType, response.credits_spent || 0)
        } else {
          toast({
            title: 'Vote failed',
            description: response.message || 'An error occurred',
            variant: 'destructive'
          })
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while voting',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
      setOpen(false)
    }
  }

  const handleRemoveVote = async () => {
    if (!isVoted) return

    setIsLoading(true)

    try {
      const response = await api.votes.removeVote(targetType, targetId)
      setVoteWeight(0)
      setIsVoted(false)
      setCredits((prev) => (prev || 0) + (response.credits_refunded || 0))
      
      toast({
        title: 'Vote removed',
        description: `${response.credits_refunded || 0} credits refunded`,
      })
      
      if (onUnvote) onUnvote()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while removing vote',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {allowDownvote && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            sizeClasses[size],
            voteType === -1 && isVoted && 'text-orange-500 dark:text-orange-400',
            'rounded-full'
          )}
          disabled={isLoading}
          onClick={() => {
            if (isVoted && voteType === -1) {
              handleRemoveVote()
            } else {
              setVoteType(-1)
              if (!open) setOpen(true)
            }
          }}
        >
          <ChevronDown size={iconSizes[size]} />
        </Button>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={isVoted ? "default" : "outline"}
            size="icon"
            className={cn(
              sizeClasses[size],
              isVoted && voteType === 1 && 'bg-primary text-primary-foreground',
              isVoted && voteType === -1 && 'bg-orange-500 text-white dark:bg-orange-600',
              'rounded-full my-1 relative'
            )}
            disabled={isLoading}
          >
            {isVoted ? (
              <div className="flex items-center justify-center">
                <span className="text-sm font-bold">{voteWeight}</span>
              </div>
            ) : (
              <Triangle size={iconSizes[size] - 4} />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Quadratic Voting</h3>
              <div className="flex items-center bg-muted p-1 px-2 rounded text-xs">
                <Info className="h-3 w-3 mr-1" />
                <span>{credits !== null ? `${credits} credits available` : 'Loading credits...'}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Vote weight: {voteWeight}</span>
                <span className="text-sm text-muted-foreground">Cost: {calculateCost(voteWeight)} credits</span>
              </div>
              
              <Slider
                value={[voteWeight]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setVoteWeight(value[0])}
              />
              
              <div className="text-xs text-muted-foreground">
                Higher vote weight = quadratically higher cost. Impact = linear.
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button
                  variant={voteType === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVoteType(1)}
                  className="flex-1"
                >
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Upvote
                </Button>
                
                {allowDownvote && (
                  <Button
                    variant={voteType === -1 ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setVoteType(-1)}
                    className="flex-1"
                  >
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Downvote
                  </Button>
                )}
              </div>
              
              <Button
                size="sm"
                onClick={handleVote}
                disabled={
                  isLoading || 
                  credits === null || 
                  (calculateCost(voteWeight) > (credits || 0) && !isVoted)
                }
              >
                {isLoading ? 'Processing...' : isVoted ? 'Remove Vote' : 'Cast Vote'}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {allowDownvote ? null : (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            sizeClasses[size],
            voteType === 1 && isVoted && 'text-primary',
            'rounded-full'
          )}
          disabled={isLoading}
          onClick={() => {
            if (isVoted && voteType === 1) {
              handleRemoveVote()
            } else {
              setVoteType(1)
              if (!open) setOpen(true)
            }
          }}
        >
          <ChevronUp size={iconSizes[size]} />
        </Button>
      )}
    </div>
  )
}