'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signInWithOtp, signOut } from '@/app/actions'
import { User as SupabaseUser } from '@supabase/supabase-js' // Import the User type from Supabase

export function AuthButton() {
  const [user, setUser] = useState<SupabaseUser | null>(null) // Use SupabaseUser type
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleSignInWithOtp = async (formData: FormData) => {
    setLoading(true)
    const result = await signInWithOtp(formData)
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Magic link sent",
        description: "Check your email for the login link",
      })
    }
    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-gray-900 border-gray-800">
        {user ? (
          <DropdownMenuItem onSelect={signOut} className="text-white">
            Sign Out
          </DropdownMenuItem>
        ) : (
          <form action={handleSignInWithOtp} className="p-2">
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="mb-2 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Sign In with Email'}
            </Button>
          </form>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
