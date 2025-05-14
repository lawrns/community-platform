"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion } from "framer-motion"
import { Loader2, Camera } from "lucide-react"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getSupabase } from "@/lib/supabase"
import { Tables } from "@/lib/supabase"

const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username must be at most 20 characters" })
    .regex(/^[a-z0-9_-]+$/, { message: "Username can only contain lowercase letters, numbers, underscores, and hyphens" }),
  display_name: z.string().max(50, { message: "Display name must be at most 50 characters" }).optional(),
  bio: z.string().max(500, { message: "Bio must be at most 500 characters" }).optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

export default function ProfileForm() {
  const router = useRouter()
  const [user, setUser] = useState<Tables["users"]["Row"] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      display_name: "",
      bio: "",
      website: "",
    },
  })

  useEffect(() => {
    async function loadUserProfile() {
      setIsLoading(true)
      
      try {
        const supabase = getSupabase()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          router.push("/signin")
          return
        }
        
        // Fetch user profile from database
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single()
        
        if (error) throw error
        
        if (data) {
          setUser(data)
          
          // Set form default values
          form.reset({
            username: data.username || "",
            display_name: data.display_name || "",
            bio: data.bio || "",
            website: data.website || "",
          })
        }
      } catch (err: any) {
        console.error("Error loading profile:", err)
        setError(err.message || "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUserProfile()
  }, [router, form])

  async function onSubmit(values: FormValues) {
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      const supabase = getSupabase()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        throw new Error("Not authenticated")
      }
      
      // Update user profile in database
      const { error } = await supabase
        .from("users")
        .update({
          username: values.username,
          display_name: values.display_name,
          bio: values.bio,
          website: values.website,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authUser.id)
      
      if (error) throw error
      
      setSuccess("Profile updated successfully")
      router.refresh()
    } catch (err: any) {
      console.error("Error updating profile:", err)
      setError(err.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-3 rounded-md bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-300"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-3 rounded-md bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300"
        >
          {success}
        </motion.div>
      )}

      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 mb-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.display_name || user.username} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-4xl font-bold text-gray-400 dark:text-gray-500">
                {user?.display_name?.charAt(0) || user?.username?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <button className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">
            {user?.display_name || user?.username || "User"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="johnsmith" {...field} disabled={isSaving} />
                </FormControl>
                <FormDescription>
                  Your unique username on the platform.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Smith" {...field} disabled={isSaving} />
                </FormControl>
                <FormDescription>
                  This is how your name will appear publicly.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <textarea
                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Tell us a bit about yourself"
                    {...field}
                    disabled={isSaving}
                  />
                </FormControl>
                <FormDescription>
                  A short bio about yourself. This will be displayed on your profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://yourwebsite.com" {...field} disabled={isSaving} />
                </FormControl>
                <FormDescription>
                  Your personal or professional website.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" disabled={isSaving} onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}