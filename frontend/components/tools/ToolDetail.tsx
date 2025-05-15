"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { isBrowser } from '@/lib/environment';
import Link from 'next/link';
import { ArrowLeft, Star, ExternalLink, ThumbsUp, Flag, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Tool, ToolReview } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import ClientSideOnly from '@/components/ClientSideOnly';

interface ToolDetailProps {
  tool: Tool;
  reviews: ToolReview[];
  onReviewSubmit?: (review: ToolReview) => void;
}

export default function ToolDetail({ tool, reviews: initialReviews, onReviewSubmit }: ToolDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [reviews, setReviews] = useState<ToolReview[]>(initialReviews || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a review",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const reviewData = {
        rating: reviewRating,
        content: reviewContent,
        title: reviewContent.split('.')[0] // Use first sentence as title
      };
      
      const response = await api.tools.createReview(tool.id, reviewData);
      
      // Add new review to list with current user info
      const newReview: ToolReview = {
        ...response,
        user_name: user?.username || 'Anonymous',
        user_id: user?.id
      };
      
      setReviews([newReview, ...reviews]);
      
      // Call callback if provided
      if (onReviewSubmit) {
        onReviewSubmit(newReview);
      }
      
      // Reset form
      setReviewRating(0);
      setReviewContent("");
      
      toast({
        title: "Review Submitted",
        description: "Thank you for your review!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upvote",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (hasUpvoted) {
        await api.tools.removeUpvote(tool.id);
        setHasUpvoted(false);
        toast({
          title: "Upvote Removed",
          description: "Your upvote has been removed"
        });
      } else {
        await api.tools.upvoteTool(tool.id);
        setHasUpvoted(true);
        toast({
          title: "Upvoted",
          description: "You've upvoted this tool"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update upvote. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to update upvote:", error);
    }
  };

  const handleShare = () => {
    // Only run in browser environment
    if (!isBrowser()) return;
    
    if (navigator.share) {
      navigator.share({
        title: tool.name,
        text: tool.description,
        url: window.location.href,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Tool link copied to clipboard!",
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href="/tools" className="inline-flex items-center text-primary mb-6 hover:underline">
          <ArrowLeft size={16} className="mr-2" />
          Back to Tools Directory
        </Link>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-6">
              <img 
                src={tool.logo_url || 'https://placehold.co/800x400'} 
                alt={tool.name} 
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
          
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="border-b mb-6">
              <div className="flex overflow-x-auto">
                {["overview", "features", "reviews", "pricing"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 font-medium text-sm capitalize whitespace-nowrap ${
                      activeTab === tab
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Tab Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">About {tool.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {tool.description}
                  </p>
                </div>
                
                {tool.features && tool.features.use_cases && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Use Cases</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {tool.features.use_cases.map((useCase: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-primary"></span>
                          {useCase}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "features" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Features</h2>
                {tool.features && tool.features.key_features ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tool.features.key_features.map((feature: string, index: number) => (
                      <div 
                        key={index} 
                        className="p-4 border rounded-lg flex items-start gap-3 hover:border-primary transition-colors"
                      >
                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </div>
                        <div>{feature}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No feature information available.</p>
                )}
              </div>
            )}
            
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">User Reviews</h2>
                
                {/* Review Form */}
                <div className="p-6 border rounded-lg mb-8">
                  <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setReviewRating(rating)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                reviewRating >= rating 
                                  ? "text-yellow-400 fill-current" 
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Review</label>
                      <textarea
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={4}
                        placeholder="Share your experience with this tool..."
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                      disabled={reviewRating === 0 || !reviewContent.trim() || isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
                
                {/* Review List */}
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                      <motion.div 
                        key={review.id}
                        className="p-6 border rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold">{review.user_name}</div>
                            <div className="text-sm text-gray-500">
                              {review.created_at ? format(new Date(review.created_at), 'MMM d, yyyy') : ''}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{review.content}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <button className="flex items-center gap-1 text-gray-500 hover:text-primary">
                            <ThumbsUp size={14} />
                            Helpful ({review.upvotes || 0})
                          </button>
                          <button className="flex items-center gap-1 text-gray-500 hover:text-primary">
                            <Flag size={14} />
                            Report
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      No reviews yet. Be the first to review!
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === "pricing" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Pricing Plans</h2>
                {tool.pricing_info && tool.pricing_info.plans ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tool.pricing_info.plans.map((plan: any, index: number) => (
                      <motion.div 
                        key={index}
                        className={`border rounded-lg overflow-hidden ${
                          plan.is_popular ? "border-primary" : ""
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className={`p-4 ${
                          plan.is_popular ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800"
                        }`}>
                          <h3 className="text-xl font-bold">{plan.name}</h3>
                          <div className="text-2xl font-bold mt-2">{plan.price}</div>
                        </div>
                        <div className="p-6">
                          <ul className="space-y-3">
                            {plan.features.map((feature: string, i: number) => (
                              <li key={i} className="flex items-center gap-2">
                                <svg 
                                  className="h-5 w-5 text-green-500 flex-shrink-0" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M5 13l4 4L19 7" 
                                  />
                                </svg>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <a 
                            href={tool.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`block text-center mt-6 px-4 py-2 rounded-md ${
                              plan.is_popular
                                ? "bg-primary text-white hover:bg-primary/90"
                                : "border border-primary text-primary hover:bg-primary/10"
                            } transition-colors`}
                          >
                            Get Started
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No pricing information available.</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Sidebar */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="border rounded-lg overflow-hidden sticky top-24">
              <div className="p-6 border-b">
                <h1 className="text-2xl font-bold mb-1">{tool.name}</h1>
                <p className="text-gray-500 mb-4">{tool.vendor_name || (tool.is_verified ? 'Verified Vendor' : 'Community Submission')}</p>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(tool.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium ml-2">{tool.rating || '0'}</span>
                  <span className="text-xs text-gray-500">({tool.reviews_count || 0} reviews)</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tool.tags && tool.tags.map((tag: string, index: number) => (
                    <span key={index} className={`px-3 py-1 ${index === 0 ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800'} text-xs rounded-full`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <a 
                  href={tool.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block w-full px-4 py-2 bg-primary text-white text-center rounded-md hover:bg-primary/90 transition-colors"
                >
                  Visit Website
                  <ExternalLink size={14} className="inline-block ml-2" />
                </a>
              </div>
              <div className="p-6">
                <h3 className="font-medium mb-3">Tool Information</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="text-gray-500">Listing Type</span>
                    <span>{tool.is_verified ? 'Verified' : 'Community'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Added</span>
                    <span>{tool.created_at ? format(new Date(tool.created_at), 'MMM d, yyyy') : 'Unknown'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Last Updated</span>
                    <span>{tool.updated_at ? format(new Date(tool.updated_at), 'MMM d, yyyy') : 'Unknown'}</span>
                  </li>
                </ul>
                <div className="mt-6 flex gap-2">
                  <button 
                    className={`flex items-center gap-1 ${hasUpvoted ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
                    onClick={handleUpvote}
                  >
                    <ThumbsUp size={14} />
                    {hasUpvoted ? 'Upvoted' : 'Upvote'}
                  </button>
                  <button 
                    className="flex items-center gap-1 text-gray-500 hover:text-primary"
                    onClick={handleShare}
                  >
                    <Share2 size={14} />
                    Share
                  </button>
                  <button className="flex items-center gap-1 text-gray-500 hover:text-primary">
                    <Flag size={14} />
                    Report
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}