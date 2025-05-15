"use client"

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Tool, ToolReview } from '@/lib/types'
import { api } from '@/lib/api'
import ToolDetail from '@/components/tools/ToolDetail'
import { useToast } from '@/components/ui/use-toast'

export default function ToolClientPage({ params }: { params: { id: string } }) {
  const [tool, setTool] = useState<Tool | null>(null)
  const [reviews, setReviews] = useState<ToolReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  useEffect(() => {
    const fetchToolData = async () => {
      try {
        setLoading(true)
        
        // Fetch tool data
        const toolResponse = await api.tools.getTool(params.id)
        setTool(toolResponse.tool)
        
        // Fetch reviews
        const reviewsResponse = await api.tools.getReviews(params.id, { 
          limit: 10, 
          page: 1, 
          sort: 'newest' 
        })
        setReviews(reviewsResponse.reviews || [])
        
      } catch (error) {
        console.error('Error fetching tool data:', error)
        setError('Failed to load tool data. Please try again later.')
        toast({
          title: "Error",
          description: "Failed to load tool data. Please try again later.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchToolData()
  }, [params.id, toast])
  
  const handleReviewSubmit = (review: ToolReview) => {
    // Add review to list
    setReviews([review, ...reviews])
    
    // Update tool rating and review count in state
    if (tool) {
      const newReviewCount = (tool.reviews_count || 0) + 1
      const currentRatingTotal = (tool.rating || 0) * (tool.reviews_count || 0)
      const newRating = (currentRatingTotal + review.rating) / newReviewCount
      
      setTool({
        ...tool,
        rating: parseFloat(newRating.toFixed(1)),
        reviews_count: newReviewCount
      })
    }
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-lg">Loading tool details...</p>
        </div>
      </div>
    )
  }
  
  if (error || !tool) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Tool Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error || "Sorry, the tool you're looking for doesn't exist or has been removed."}
        </p>
        <Link href="/tools" className="text-primary hover:underline">
          Back to Tools Directory
        </Link>
      </div>
    )
  }
  
  return <ToolDetail tool={tool} reviews={reviews} onReviewSubmit={handleReviewSubmit} />
}
