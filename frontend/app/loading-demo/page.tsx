"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingPage } from "@/components/ui/loading-page";
import { useLoading } from "@/lib/loading-context";
import { useLoadingState } from "@/lib/hooks/useLoadingState";
import { AnimatedButton, HoverCard } from "@/components/motion";
import { MotionWrapper } from "@/components/motion/MotionWrapper";
import {
  SkeletonAvatar,
  SkeletonText,
  SkeletonParagraph,
  SkeletonCard,
  SkeletonToolCard,
  SkeletonListItem,
  SkeletonProfile,
  SkeletonFeed,
  SkeletonForm,
  SkeletonComments,
  SkeletonGrid,
} from "@/components/ui/skeleton-loaders";

export default function LoadingDemo() {
  const { showLoading, hideLoading, showToast } = useLoading();
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  // Demo loading state hooks
  const cardLoading = useLoadingState({
    duration: 3000,
    simulateError: true,
  });

  const feedLoading = useLoadingState({
    duration: 4000,
  });

  const profileLoading = useLoadingState({
    duration: 5000,
  });

  const showPageLoading = () => {
    showLoading("Loading page content...");
    setTimeout(() => {
      hideLoading();
      showToast({
        variant: "success",
        title: "Loading Complete",
        message: "Page content loaded successfully!",
      });
    }, 3000);
  };

  const renderSelectedDemo = () => {
    switch (selectedDemo) {
      case "spinners":
        return <SpinnerDemo />;
      case "skeletons":
        return <SkeletonDemo />;
      case "cards":
        return (
          <CardLoadingDemo
            isLoading={cardLoading.isLoading}
            error={cardLoading.error}
            onRetry={() => cardLoading.startLoading()}
          />
        );
      case "feed":
        return (
          <FeedLoadingDemo
            isLoading={feedLoading.isLoading}
            onRefresh={() => feedLoading.startLoading()}
          />
        );
      case "profile":
        return (
          <ProfileLoadingDemo
            isLoading={profileLoading.isLoading}
            onRefresh={() => profileLoading.startLoading()}
          />
        );
      default:
        return (
          <div className="text-center py-16">
            <h3 className="text-display-lg font-semibold mb-4">Select a Demo</h3>
            <p className="text-content-secondary">
              Choose a loading state demo from the menu above to see it in action.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-16 text-center">
        <h1 className="text-display-2xl font-bold text-content-primary mb-4">
          Loading State Demos
        </h1>
        <p className="text-body-lg text-content-secondary max-w-3xl mx-auto">
          This page demonstrates the various loading states and animations available in the Community Platform.
        </p>
      </div>

      <div className="flex flex-wrap mb-8 gap-2 justify-center">
        <AnimatedButton
          variant={selectedDemo === "spinners" ? "default" : "outline"}
          onClick={() => setSelectedDemo("spinners")}
          withRipple
        >
          Spinners
        </AnimatedButton>
        <AnimatedButton
          variant={selectedDemo === "skeletons" ? "default" : "outline"}
          onClick={() => setSelectedDemo("skeletons")}
          withRipple
        >
          Skeleton Loaders
        </AnimatedButton>
        <AnimatedButton
          variant={selectedDemo === "cards" ? "default" : "outline"}
          onClick={() => {
            setSelectedDemo("cards");
            cardLoading.startLoading();
          }}
          withRipple
        >
          Card Loading
        </AnimatedButton>
        <AnimatedButton
          variant={selectedDemo === "feed" ? "default" : "outline"}
          onClick={() => {
            setSelectedDemo("feed");
            feedLoading.startLoading();
          }}
          withRipple
        >
          Feed Loading
        </AnimatedButton>
        <AnimatedButton
          variant={selectedDemo === "profile" ? "default" : "outline"}
          onClick={() => {
            setSelectedDemo("profile");
            profileLoading.startLoading();
          }}
          withRipple
        >
          Profile Loading
        </AnimatedButton>
        <AnimatedButton
          variant="secondary"
          onClick={showPageLoading}
          withRipple
          withScale
        >
          Show Full Page Loading
        </AnimatedButton>
      </div>

      <MotionWrapper variant="fadeIn" className="mt-8">
        {renderSelectedDemo()}
      </MotionWrapper>
    </div>
  );
}

function SpinnerDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spinners</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center space-y-6">
            <h3 className="text-content-primary font-semibold">Circle Spinners</h3>
            <div className="flex flex-col items-center gap-4">
              <Spinner size="xs" variant="circle" />
              <Spinner size="sm" variant="circle" />
              <Spinner size="md" variant="circle" />
              <Spinner size="lg" variant="circle" />
              <Spinner size="xl" variant="circle" />
            </div>
          </div>

          <div className="flex flex-col items-center space-y-6">
            <h3 className="text-content-primary font-semibold">Dot Spinners</h3>
            <div className="flex flex-col items-center gap-4">
              <Spinner size="xs" variant="dots" />
              <Spinner size="sm" variant="dots" />
              <Spinner size="md" variant="dots" />
              <Spinner size="lg" variant="dots" />
              <Spinner size="xl" variant="dots" />
            </div>
          </div>

          <div className="flex flex-col items-center space-y-6">
            <h3 className="text-content-primary font-semibold">Pulse Spinners</h3>
            <div className="flex flex-col items-center gap-4">
              <Spinner size="xs" variant="pulse" />
              <Spinner size="sm" variant="pulse" />
              <Spinner size="md" variant="pulse" />
              <Spinner size="lg" variant="pulse" />
              <Spinner size="xl" variant="pulse" />
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-content-primary font-semibold">With Text</h3>
            <div className="space-y-6">
              <Spinner variant="circle" text="Loading..." textPosition="right" />
              <Spinner variant="dots" text="Processing data..." textPosition="right" />
              <Spinner variant="pulse" text="Please wait..." textPosition="bottom" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-content-primary font-semibold">Colored Spinners</h3>
            <div className="space-y-6">
              <Spinner variant="circle" color="hsl(var(--semantic-success))" text="Success" />
              <Spinner variant="circle" color="hsl(var(--semantic-error))" text="Error" />
              <Spinner variant="circle" color="hsl(var(--semantic-warning))" text="Warning" />
              <Spinner variant="circle" color="hsl(var(--semantic-info))" text="Info" />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-content-primary font-semibold mb-4">Full Page Loading</h3>
          <div className="border rounded-lg p-6">
            <LoadingPage fullscreen={false} variant="spinner" />
          </div>

          <div className="border rounded-lg p-6 mt-6">
            <LoadingPage fullscreen={false} variant="dots" text="Loading page content..." />
          </div>

          <div className="border rounded-lg p-6 mt-6">
            <LoadingPage fullscreen={false} variant="progress" text="Uploading file (67%)..." />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skeleton Loaders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-12">
        <div className="space-y-4">
          <h3 className="text-content-primary font-semibold">Basic Elements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="text-body text-content-secondary">Avatars</h4>
              <div className="flex gap-4">
                <SkeletonAvatar size="sm" />
                <SkeletonAvatar size="md" />
                <SkeletonAvatar size="lg" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-body text-content-secondary">Text</h4>
              <div className="space-y-2">
                <SkeletonText width="sm" height="sm" />
                <SkeletonText width="md" height="md" />
                <SkeletonText width="lg" height="lg" />
                <SkeletonText width="full" height="md" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-body text-content-secondary">Paragraph</h4>
              <SkeletonParagraph lines={3} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-content-primary font-semibold">Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-body text-content-secondary mb-2">Basic Card</h4>
              <SkeletonCard />
            </div>
            <div>
              <h4 className="text-body text-content-secondary mb-2">Tool Card</h4>
              <SkeletonToolCard />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-content-primary font-semibold">List Items</h3>
          <div className="border rounded-lg p-4">
            <SkeletonListItem />
            <SkeletonListItem />
            <SkeletonListItem />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-content-primary font-semibold">Forms</h3>
          <SkeletonForm inputs={3} />
        </div>

        <div className="space-y-4">
          <h3 className="text-content-primary font-semibold">Comment Section</h3>
          <SkeletonComments count={3} />
        </div>
      </CardContent>
    </Card>
  );
}

function CardLoadingDemo({
  isLoading,
  error,
  onRetry
}: {
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}) {
  if (error) {
    return (
      <MotionWrapper variant="fadeIn">
        <div className="p-16 text-center">
          <h3 className="text-display-lg font-semibold text-semantic-error mb-4">Error Loading Cards</h3>
          <p className="text-content-secondary mb-6">{error.message}</p>
          <Button onClick={onRetry}>Retry</Button>
        </div>
      </MotionWrapper>
    );
  }

  if (isLoading) {
    return (
      <MotionWrapper variant="fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </MotionWrapper>
    );
  }

  return (
    <MotionWrapper variant="fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <HoverCard
            key={index}
            title={`Card ${index + 1}`}
            description="This is a sample card with hover effects"
            hoverScale={1.03}
            hoverElevation
            hoverGlow={index % 3 === 0}
          >
            <div className="h-40 bg-surface-2 rounded-md mb-4 flex items-center justify-center">
              <span className="text-content-secondary">Card Content {index + 1}</span>
            </div>
            <p className="text-content-secondary">This card demonstrates loading states and animations.</p>
          </HoverCard>
        ))}
      </div>
      <div className="mt-8 text-center">
        <AnimatedButton onClick={onRetry} withRipple withScale>
          Reload Cards
        </AnimatedButton>
      </div>
    </MotionWrapper>
  );
}

function FeedLoadingDemo({
  isLoading,
  onRefresh
}: {
  isLoading: boolean;
  onRefresh: () => void;
}) {
  if (isLoading) {
    return (
      <MotionWrapper variant="fadeIn">
        <SkeletonFeed items={3} />
      </MotionWrapper>
    );
  }

  return (
    <MotionWrapper variant="fadeIn">
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="overflow-hidden p-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-surface-2 mr-3 flex items-center justify-center">
                <span className="text-content-secondary text-sm">U{index + 1}</span>
              </div>
              <div>
                <h4 className="text-body font-medium">User Name {index + 1}</h4>
                <p className="text-xs text-content-secondary">Posted 2 hours ago</p>
              </div>
            </div>
            <p className="mb-4">This is a sample feed post with loading state demonstration.</p>
            <div className="bg-surface-2 h-40 rounded-md mb-4 flex items-center justify-center">
              <span className="text-content-secondary">Post Image {index + 1}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">Like</Button>
                <Button size="sm" variant="ghost">Comment</Button>
                <Button size="sm" variant="ghost">Share</Button>
              </div>
            </div>
          </Card>
        ))}
        <div className="text-center mt-8">
          <AnimatedButton onClick={onRefresh} withRipple withScale>
            Refresh Feed
          </AnimatedButton>
        </div>
      </div>
    </MotionWrapper>
  );
}

function ProfileLoadingDemo({
  isLoading,
  onRefresh
}: {
  isLoading: boolean;
  onRefresh: () => void;
}) {
  if (isLoading) {
    return (
      <MotionWrapper variant="fadeIn">
        <SkeletonProfile />
      </MotionWrapper>
    );
  }

  return (
    <MotionWrapper variant="fadeIn">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-surface-2 flex items-center justify-center">
            <span className="text-content-secondary text-display-sm">JD</span>
          </div>
          <div className="space-y-2 flex-1 text-center sm:text-left">
            <h2 className="text-display-lg font-semibold">John Doe</h2>
            <p className="text-content-secondary">AI Developer & Community Enthusiast</p>
            <div className="flex justify-center sm:justify-start gap-2 pt-2">
              <Button size="sm">Follow</Button>
              <Button size="sm" variant="outline">Message</Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-display-sm font-medium">About</h3>
          <p className="text-content-secondary">
            This is a sample profile page demonstrating loading states and animations.
            The content is loaded with animated skeletons to improve the perceived performance.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-display-sm font-medium">Recent Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="text-body font-medium mb-2">Project Name</h4>
                <p className="text-content-secondary text-body-sm">
                  A brief description of the project would go here. This demonstrates card loading.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="text-body font-medium mb-2">Another Project</h4>
                <p className="text-content-secondary text-body-sm">
                  A brief description of another project. This demonstrates multiple card loading.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center mt-8">
          <AnimatedButton onClick={onRefresh} withRipple withScale>
            Reload Profile
          </AnimatedButton>
        </div>
      </div>
    </MotionWrapper>
  );
}