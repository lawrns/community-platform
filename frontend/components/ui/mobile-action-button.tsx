"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthContext"
import { FloatingActionButton } from "./floating-action-button"
import { SpeedDial } from "./speed-dial"
import { Plus, PenSquare, MessageSquare, Wrench, Settings, Heart, Send, Share2 } from "lucide-react"

type ActionContext = "default" | "dashboard" | "profile" | "tools" | "topics" | "create" | "view"

/**
 * MobileActionButton - Context-aware floating action button for mobile devices
 * 
 * Displays different actions based on current page context:
 * - Default: Shows create FAB with options
 * - Dashboard: Shows create/add options
 * - Profile: Shows settings/preferences
 * - Tools: Shows create/add tool
 * - Topics: Shows follow/create topic
 * - Create: Shows publish/save/preview
 * - View: Shows interact/share options
 */
export function MobileActionButton() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [actionContext, setActionContext] = useState<ActionContext>("default")
  const [isVisible, setIsVisible] = useState(true)
  
  // Detect context based on current URL path
  useEffect(() => {
    // Hide completely on certain pages
    if (pathname === "/signin" || pathname === "/signup" || pathname.includes("/design-system")) {
      setIsVisible(false)
      return
    }
    
    // Otherwise determine the context
    setIsVisible(true)
    
    if (pathname.includes("/dashboard")) {
      setActionContext("dashboard")
    } else if (pathname.includes("/profile")) {
      setActionContext("profile")
    } else if (pathname.includes("/tools")) {
      setActionContext("tools")
    } else if (pathname.includes("/topics")) {
      setActionContext("topics")
    } else if (pathname.includes("/create")) {
      setActionContext("create")
    } else if (pathname.includes("/view")) {
      setActionContext("view")
    } else {
      setActionContext("default")
    }
  }, [pathname])
  
  // Only show when user is logged in
  if (!user || !isVisible) {
    return null
  }
  
  // Define different action sets based on context
  const getContextActions = () => {
    switch (actionContext) {
      case "dashboard":
        return {
          main: {
            icon: <Plus />,
            onClick: () => {},
            label: "Create"
          },
          actions: [
            {
              icon: <PenSquare />,
              label: "Write Post",
              onClick: () => router.push("/create")
            },
            {
              icon: <Wrench />,
              label: "Add Tool",
              onClick: () => router.push("/tools/submit")
            },
            {
              icon: <MessageSquare />,
              label: "Ask Question",
              onClick: () => router.push("/q-and-a/ask")
            },
          ]
        }
        
      case "profile":
        return {
          main: {
            icon: <Settings />,
            onClick: () => router.push("/settings"),
            label: "Settings"
          },
          actions: []
        }
        
      case "tools":
        return {
          main: {
            icon: <Plus />,
            onClick: () => router.push("/tools/submit"),
            label: "Add Tool"
          },
          actions: []
        }
        
      case "topics":
        return {
          main: {
            icon: <Plus />,
            onClick: () => {},
            label: "Create"
          },
          actions: [
            {
              icon: <PenSquare />,
              label: "New Topic",
              onClick: () => router.push("/topics/create")
            },
            {
              icon: <Heart />,
              label: "Follow Topic",
              onClick: () => {},
              variant: "accent"
            }
          ]
        }
        
      case "create":
        return {
          main: {
            icon: <Send />,
            onClick: () => {},
            label: "Publish"
          },
          actions: [
            {
              icon: <Share2 />,
              label: "Share Draft",
              onClick: () => {},
              variant: "secondary"
            }
          ]
        }
        
      case "view":
        return {
          main: {
            icon: <Heart />,
            onClick: () => {},
            label: "Like"
          },
          actions: [
            {
              icon: <MessageSquare />,
              label: "Comment",
              onClick: () => {},
              variant: "secondary"
            },
            {
              icon: <Share2 />,
              label: "Share",
              onClick: () => {},
              variant: "accent"
            }
          ]
        }
        
      default:
        return {
          main: {
            icon: <Plus />,
            onClick: () => {},
            label: "Create"
          },
          actions: [
            {
              icon: <PenSquare />,
              label: "Write Post",
              onClick: () => router.push("/create")
            },
            {
              icon: <Wrench />,
              label: "Add Tool",
              onClick: () => router.push("/tools/submit")
            },
            {
              icon: <MessageSquare />,
              label: "Ask Question",
              onClick: () => router.push("/q-and-a/ask")
            }
          ]
        }
    }
  }
  
  const contextConfig = getContextActions()
  
  // If actions array is empty, just show a single FAB
  if (contextConfig.actions.length === 0) {
    return (
      <div className="md:hidden">
        <FloatingActionButton
          position="bottom-right"
          size="lg"
          variant="primary"
          icon={contextConfig.main.icon}
          onClick={contextConfig.main.onClick}
          extended={true}
          label={contextConfig.main.label}
        />
      </div>
    )
  }
  
  // Otherwise show a SpeedDial with multiple actions
  return (
    <div className="md:hidden">
      <SpeedDial
        position="bottom-right"
        size="lg"
        variant="primary"
        direction="up"
        icon={contextConfig.main.icon}
        actions={contextConfig.actions}
        labels={true}
        mainLabel={contextConfig.main.label}
      />
    </div>
  )
}