"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface VoteControlsProps {
  contentId: string;
  initialUpvotes: number;
  isQuestion?: boolean;
  isAnswer?: boolean;
  questionId?: string;
  isAccepted?: boolean;
  onAccept?: () => void;
  canAccept?: boolean;
}

export default function VoteControls({
  contentId,
  initialUpvotes,
  isQuestion = false,
  isAnswer = false,
  questionId,
  isAccepted = false,
  onAccept,
  canAccept = false
}: VoteControlsProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkVoteStatus = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await fetch(`/api/content/${contentId}/vote-status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setHasUpvoted(data.has_upvoted);
        }
      } catch (err) {
        console.error('Error checking vote status:', err);
      }
    };

    checkVoteStatus();
  }, [contentId, isAuthenticated]);

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to vote',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);

      if (hasUpvoted) {
        await api.content.removeUpvote(contentId);
        setUpvotes(prev => prev - 1);
        setHasUpvoted(false);
      } else {
        await api.content.upvote(contentId);
        setUpvotes(prev => prev + 1);
        setHasUpvoted(true);
      }
    } catch (err: any) {
      console.error('Error voting:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to vote. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptAnswer = async () => {
    if (!isAuthenticated || !questionId || !isAnswer) return;

    try {
      setIsLoading(true);
      await api.content.acceptAnswer(questionId, contentId);

      toast({
        title: 'Answer Accepted',
        description: 'This answer has been marked as the accepted solution'
      });

      if (onAccept) {
        onAccept();
      }
    } catch (err: any) {
      console.error('Error accepting answer:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to accept answer. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-full p-0 h-8 w-8 ${
          hasUpvoted ? 'text-primary bg-primary/10' : ''
        }`}
        onClick={handleUpvote}
        disabled={isLoading}
      >
        <ThumbsUp className="h-4 w-4" />
        <span className="sr-only">Upvote</span>
      </Button>

      <span className="text-sm font-medium">{upvotes}</span>

      {isAnswer && canAccept && !isAccepted && (
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full p-0 h-8 w-8 mt-2"
          onClick={handleAcceptAnswer}
          disabled={isLoading}
          title="Accept this answer"
        >
          <Check className="h-4 w-4" />
          <span className="sr-only">Accept answer</span>
        </Button>
      )}

      {isAnswer && isAccepted && (
        <div className="rounded-full p-0 h-8 w-8 mt-2 bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <Check className="h-4 w-4 text-green-600 dark:text-green-300" />
        </div>
      )}
    </div>
  );
}