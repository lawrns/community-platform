'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { 
  Home, Search, Settings, User, Tool, MessagesSquare, 
  Hash, PanelLeft, LogOut, FileText, Wrench, BookOpen
} from 'lucide-react'

export default function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/'))}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
            <CommandShortcut>⌘H</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard'))}
          >
            <PanelLeft className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/search'))}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Community">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/tools'))}
          >
            <Wrench className="mr-2 h-4 w-4" />
            <span>Tools</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/q-and-a'))}
          >
            <MessagesSquare className="mr-2 h-4 w-4" />
            <span>Q&A</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/topics'))}
          >
            <Hash className="mr-2 h-4 w-4" />
            <span>Topics</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Account">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/profile'))}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/settings'))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => console.log('Logout'))}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}