'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Key, Shield, Fingerprint, Trash } from 'lucide-react'
import { api } from '@/lib/api'
import WebAuthnButton from './WebAuthnButton'
import { useAuth } from './AuthContext'

export default function WebAuthnSetup() {
  const [credentials, setCredentials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newCredentialName, setNewCredentialName] = useState('')
  const [credentialToRename, setCredentialToRename] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const loadCredentials = async () => {
    try {
      setIsLoading(true)
      const response = await api.auth.getWebAuthnCredentials()
      setCredentials(response.credentials || [])
    } catch (error) {
      console.error('Error loading credentials:', error)
      toast({
        title: 'Failed to load passkeys',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCredentials()
  }, [])

  const handleDeleteCredential = async (credentialId: string) => {
    try {
      setIsDeleting(credentialId)
      await api.auth.deleteWebAuthnCredential(credentialId)
      toast({
        title: 'Passkey deleted',
        description: 'Your passkey has been successfully removed.'
      })
      loadCredentials()
    } catch (error) {
      console.error('Error deleting credential:', error)
      toast({
        title: 'Failed to delete passkey',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleRenameCredential = async () => {
    if (!credentialToRename || !editingName.trim()) return

    try {
      await api.auth.renameWebAuthnCredential(credentialToRename, editingName.trim())
      toast({
        title: 'Passkey renamed',
        description: 'Your passkey name has been updated.'
      })
      setCredentialToRename(null)
      loadCredentials()
    } catch (error) {
      console.error('Error renaming credential:', error)
      toast({
        title: 'Failed to rename passkey',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      })
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'platform':
        return <Fingerprint className="h-5 w-5 text-green-500" />
      case 'cross-platform':
        return <Key className="h-5 w-5 text-blue-500" />
      default:
        return <Shield className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passkey Authentication</CardTitle>
        <CardDescription>
          Manage your passkeys for secure, passwordless login
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              <h3 className="text-sm font-medium">Registered Passkeys</h3>
              {credentials.length === 0 ? (
                <p className="text-sm text-muted-foreground">You don't have any passkeys registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {credentials.map((credential) => (
                    <div 
                      key={credential.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(credential.deviceType)}
                        <div>
                          <p className="text-sm font-medium">{credential.name || 'Unnamed passkey'}</p>
                          <p className="text-xs text-muted-foreground">
                            Added on {new Date(credential.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setCredentialToRename(credential.id)
                                setEditingName(credential.name || '')
                              }}
                            >
                              Rename
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rename Passkey</DialogTitle>
                              <DialogDescription>
                                Give your passkey a memorable name to help you identify it.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input 
                                  id="name"
                                  value={editingName} 
                                  onChange={(e) => setEditingName(e.target.value)}
                                  placeholder="My Phone" 
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleRenameCredential}>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive"
                          onClick={() => handleDeleteCredential(credential.id)}
                          disabled={isDeleting === credential.id}
                        >
                          {isDeleting === credential.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Add a New Passkey</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register a New Passkey</DialogTitle>
                  <DialogDescription>
                    Add a new passkey to enable passwordless login on this device.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="keyName">Passkey Name</Label>
                    <Input 
                      id="keyName"
                      value={newCredentialName} 
                      onChange={(e) => setNewCredentialName(e.target.value)}
                      placeholder="My Work Laptop" 
                    />
                    <p className="text-xs text-muted-foreground">
                      A name to help you identify this passkey later.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <WebAuthnButton 
                    mode="register"
                    onSuccess={() => {
                      loadCredentials()
                      toast({
                        title: 'Passkey registered successfully',
                        description: 'You can now use this device for passwordless login'
                      })
                    }}
                    onError={(error) => {
                      toast({
                        title: 'Failed to register passkey',
                        description: error.message,
                        variant: 'destructive'
                      })
                    }}
                  />
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 border-t pt-4">
        <h4 className="text-sm font-medium">About Passkeys</h4>
        <p className="text-xs text-muted-foreground">
          Passkeys are a more secure alternative to passwords. They use biometrics 
          (like your fingerprint or face) or screen lock to verify your identity, 
          making them resistant to phishing and password leaks.
        </p>
      </CardFooter>
    </Card>
  )
}