'use client'

import { useState } from 'react'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import { Button } from '@/components/ui/button'
import { Fingerprint, Key, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from './AuthContext'
import { toast } from '@/components/ui/use-toast'

interface WebAuthnButtonProps {
  mode: 'register' | 'login'
  className?: string
  username?: string
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
}

export default function WebAuthnButton({ 
  mode, 
  className, 
  username,
  onSuccess,
  onError 
}: WebAuthnButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { login, user } = useAuth()

  const handleRegistration = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to register a passkey',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsLoading(true)

      // Get registration options from server
      const optionsResponse = await api.auth.getWebAuthnRegistrationOptions()

      // Start registration process in browser
      const attResp = await startRegistration(optionsResponse.options)

      // Send attestation to server for verification
      const verificationResponse = await api.auth.verifyWebAuthnRegistration({
        response: attResp,
        credentialName: 'Default Passkey'
      })

      if (verificationResponse.verified) {
        toast({
          title: 'Success',
          description: 'Passkey registered successfully'
        })

        if (onSuccess) {
          onSuccess(verificationResponse)
        }
      }
    } catch (error) {
      console.error('WebAuthn registration error:', error)
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })

      if (onError && error instanceof Error) {
        onError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthentication = async () => {
    try {
      setIsLoading(true)

      // Get authentication options from server
      const optionsResponse = await api.auth.getWebAuthnLoginOptions({ username })

      // Start authentication process in browser
      const assertionResponse = await startAuthentication(optionsResponse.options)

      // Send assertion to server for verification
      const verificationResponse = await api.auth.verifyWebAuthnLogin({
        response: assertionResponse,
        username
      })

      if (verificationResponse.user && verificationResponse.token) {
        // Handle successful login
        if (login) {
          await login(verificationResponse.user.email, '', verificationResponse.token)
        }

        toast({
          title: 'Success',
          description: 'Logged in successfully with your passkey'
        })

        if (onSuccess) {
          onSuccess(verificationResponse)
        }
      }
    } catch (error) {
      console.error('WebAuthn authentication error:', error)
      toast({
        title: 'Authentication failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })

      if (onError && error instanceof Error) {
        onError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = () => {
    if (mode === 'register') {
      handleRegistration()
    } else {
      handleAuthentication()
    }
  }

  return (
    <Button
      type="button"
      variant={mode === 'register' ? 'outline' : 'default'}
      className={className}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : mode === 'register' ? (
        <Key className="mr-2 h-4 w-4" />
      ) : (
        <Fingerprint className="mr-2 h-4 w-4" />
      )}
      {mode === 'register' ? 'Register Passkey' : 'Sign in with Passkey'}
    </Button>
  )
}