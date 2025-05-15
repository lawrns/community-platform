"use client"

import { useState } from "react"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { SpeedDial } from "@/components/ui/speed-dial"
import { Button } from "@/components/ui/button"
import { MobileActionButton } from "@/components/ui/mobile-action-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  MessageSquare, 
  Bell, 
  Heart, 
  Settings, 
  Share2, 
  Upload, 
  Download, 
  Bookmark, 
  Edit,
  Trash,
  Send,
  Star,
  LayoutGrid
} from "lucide-react"

export default function MobileActionDemoPage() {
  const [currentContext, setCurrentContext] = useState("default")
  
  return (
    <div className="py-10">
      <ResponsiveContainer maxWidth="4xl" background="primary" shadow="md" rounded="lg" verticalPadding="md">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Mobile Action Buttons</h1>
            <p className="text-content-secondary max-w-3xl mx-auto">
              This page demonstrates various mobile floating action buttons and speed dials,
              which enhance the mobile user experience by providing quick access to key actions.
            </p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="context">Context Aware</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Basic Floating Action Button</h2>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="relative h-64 border rounded-lg bg-surface-2 p-4 flex items-center justify-center">
                        <p className="text-content-secondary">The basic FloatingActionButton component fixed in the corner.</p>
                        <div className="absolute bottom-4 right-4">
                          <FloatingActionButton 
                            position="bottom-right" 
                            size="lg" 
                            variant="primary"
                            onClick={() => {}}
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-content-secondary text-sm">
                        <p>A simple, standalone floating action button that can be positioned in different corners.</p>
                      </div>
                    </CardContent>
                  </Card>
                </section>
                
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Speed Dial with Multiple Actions</h2>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="relative h-64 border rounded-lg bg-surface-2 p-4 flex items-center justify-center">
                        <p className="text-content-secondary">Click the FAB to reveal additional actions.</p>
                        <SpeedDial
                          position="bottom-right"
                          variant="primary"
                          size="lg"
                          direction="up"
                          labels={true}
                          actions={[
                            {
                              icon: <MessageSquare />,
                              label: "Message",
                              onClick: () => {},
                              variant: "secondary"
                            },
                            {
                              icon: <Heart />,
                              label: "Favorite",
                              onClick: () => {},
                              variant: "accent"
                            },
                            {
                              icon: <Share2 />,
                              label: "Share",
                              onClick: () => {},
                            }
                          ]}
                        />
                      </div>
                      <div className="mt-4 text-content-secondary text-sm">
                        <p>A speed dial reveals multiple related actions when clicked, providing quick access without cluttering the interface.</p>
                      </div>
                    </CardContent>
                  </Card>
                </section>
                
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Extended FAB with Label</h2>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="relative h-64 border rounded-lg bg-surface-2 p-4 flex items-center justify-center">
                        <p className="text-content-secondary">An extended FAB with a text label.</p>
                        <div className="absolute bottom-4 right-4">
                          <FloatingActionButton 
                            position="bottom-right" 
                            size="lg" 
                            variant="primary"
                            extended
                            label="Create"
                            onClick={() => {}}
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-content-secondary text-sm">
                        <p>Extended FABs include a text label to provide more context about the action.</p>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </div>
            </TabsContent>
            
            <TabsContent value="variants">
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Positions</h2>
                  <Card>
                    <CardContent className="pt-6 space-y-6">
                      <div className="relative h-64 border rounded-lg bg-surface-2 p-4 flex items-center justify-center">
                        <p className="text-content-secondary">FABs can be positioned in different corners.</p>
                        <div className="absolute bottom-4 right-4">
                          <FloatingActionButton position="bottom-right" size="md" variant="primary" onClick={() => {}} />
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <FloatingActionButton position="bottom-left" size="md" variant="secondary" onClick={() => {}} />
                        </div>
                        <div className="absolute top-4 right-4">
                          <FloatingActionButton position="top-right" size="md" variant="accent" onClick={() => {}} />
                        </div>
                        <div className="absolute top-4 left-4">
                          <FloatingActionButton position="top-left" size="md" variant="destructive" onClick={() => {}} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>
                
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Sizes</h2>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="relative h-64 border rounded-lg bg-surface-2 p-4 flex items-center justify-center gap-6">
                        <div>
                          <FloatingActionButton size="sm" variant="primary" onClick={() => {}} position="bottom-center" />
                          <p className="text-center mt-2 text-sm">Small</p>
                        </div>
                        <div>
                          <FloatingActionButton size="md" variant="primary" onClick={() => {}} position="bottom-center" />
                          <p className="text-center mt-2 text-sm">Medium</p>
                        </div>
                        <div>
                          <FloatingActionButton size="lg" variant="primary" onClick={() => {}} position="bottom-center" />
                          <p className="text-center mt-2 text-sm">Large</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>
                
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Color Variants</h2>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        <div className="flex flex-col items-center justify-center">
                          <FloatingActionButton variant="primary" onClick={() => {}} position="bottom-center" />
                          <p className="text-center mt-2 text-sm">Primary</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <FloatingActionButton variant="secondary" onClick={() => {}} position="bottom-center" />
                          <p className="text-center mt-2 text-sm">Secondary</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <FloatingActionButton variant="accent" onClick={() => {}} position="bottom-center" />
                          <p className="text-center mt-2 text-sm">Accent</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <FloatingActionButton variant="success" onClick={() => {}} position="bottom-center" />
                          <p className="text-center mt-2 text-sm">Success</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <FloatingActionButton variant="destructive" onClick={() => {}} position="bottom-center" />
                          <p className="text-center mt-2 text-sm">Destructive</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <FloatingActionButton variant="outline" onClick={() => {}} position="bottom-center" />
                          <p className="text-center mt-2 text-sm">Outline</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>
                
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Speed Dial Directions</h2>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative h-64 border rounded-lg bg-surface-2 p-4 flex items-center justify-center">
                          <p className="text-content-secondary">Direction: Up</p>
                          <SpeedDial
                            position="bottom-right"
                            variant="primary"
                            size="md"
                            direction="up"
                            labels={true}
                            actions={[
                              { icon: <Edit />, label: "Edit", onClick: () => {} },
                              { icon: <Trash />, label: "Delete", onClick: () => {} }
                            ]}
                          />
                        </div>
                        <div className="relative h-64 border rounded-lg bg-surface-2 p-4 flex items-center justify-center">
                          <p className="text-content-secondary">Direction: Down</p>
                          <SpeedDial
                            position="top-right"
                            variant="primary"
                            size="md"
                            direction="down"
                            labels={true}
                            actions={[
                              { icon: <Edit />, label: "Edit", onClick: () => {} },
                              { icon: <Trash />, label: "Delete", onClick: () => {} }
                            ]}
                          />
                        </div>
                        <div className="relative h-64 border rounded-lg bg-surface-2 p-4 flex items-center justify-center">
                          <p className="text-content-secondary">Direction: Left</p>
                          <SpeedDial
                            position="bottom-right"
                            variant="primary"
                            size="md"
                            direction="left"
                            labels={true}
                            actions={[
                              { icon: <Edit />, label: "Edit", onClick: () => {} },
                              { icon: <Trash />, label: "Delete", onClick: () => {} }
                            ]}
                          />
                        </div>
                        <div className="relative h-64 border rounded-lg bg-surface-2 p-4 flex items-center justify-center">
                          <p className="text-content-secondary">Direction: Right</p>
                          <SpeedDial
                            position="bottom-left"
                            variant="primary"
                            size="md"
                            direction="right"
                            labels={true}
                            actions={[
                              { icon: <Edit />, label: "Edit", onClick: () => {} },
                              { icon: <Trash />, label: "Delete", onClick: () => {} }
                            ]}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>
                
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Custom Icons</h2>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        <div className="flex flex-col items-center justify-center">
                          <FloatingActionButton 
                            variant="primary" 
                            icon={<Edit />} 
                            onClick={() => {}} 
                            position="bottom-center" 
                          />
                          <p className="text-center mt-2 text-sm">Edit</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <FloatingActionButton 
                            variant="accent" 
                            icon={<MessageSquare />} 
                            onClick={() => {}} 
                            position="bottom-center" 
                          />
                          <p className="text-center mt-2 text-sm">Message</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <FloatingActionButton 
                            variant="destructive" 
                            icon={<Trash />} 
                            onClick={() => {}} 
                            position="bottom-center" 
                          />
                          <p className="text-center mt-2 text-sm">Delete</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <FloatingActionButton 
                            variant="secondary" 
                            icon={<Send />} 
                            onClick={() => {}} 
                            position="bottom-center" 
                          />
                          <p className="text-center mt-2 text-sm">Send</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <FloatingActionButton 
                            variant="success" 
                            icon={<Upload />} 
                            onClick={() => {}} 
                            position="bottom-center" 
                          />
                          <p className="text-center mt-2 text-sm">Upload</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <FloatingActionButton 
                            variant="success" 
                            icon={<Heart />} 
                            onClick={() => {}} 
                            position="bottom-center" 
                          />
                          <p className="text-center mt-2 text-sm">Like</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </div>
            </TabsContent>
            
            <TabsContent value="context">
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Context-Aware Mobile Action Button</h2>
                  <p className="text-content-secondary mb-6">
                    The MobileActionButton component changes its functionality based on the current page context.
                    Try selecting different contexts below to see how it adapts.
                  </p>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Simulated Context Navigation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {["default", "dashboard", "profile", "tools", "topics", "create", "view"].map((context) => (
                          <Button 
                            key={context}
                            variant={currentContext === context ? "default" : "outline"}
                            onClick={() => setCurrentContext(context)}
                            className="capitalize"
                          >
                            {context}
                          </Button>
                        ))}
                      </div>
                      
                      <div className="relative h-96 border rounded-lg bg-surface-2 mt-6 p-4 flex flex-col items-center justify-center">
                        <div className="bg-surface-1 p-4 rounded-lg shadow-md max-w-md w-full mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium capitalize">{currentContext} Page</h3>
                            <span className="text-xs bg-surface-3 px-2 py-1 rounded">Simulated</span>
                          </div>
                          <p className="text-content-secondary text-sm">
                            This is a simulated {currentContext} page. The floating action button has adapted
                            to provide relevant actions for this context.
                          </p>
                        </div>
                        
                        <div className="bg-surface-3 p-4 rounded-lg max-w-md w-full">
                          <p className="text-sm text-content-secondary">
                            <span className="font-medium">Instructions:</span> Click the floating action button in the
                            bottom right corner to see the available actions for this context.
                          </p>
                        </div>
                        
                        {/* Dynamically insert an appropriate FAB for this context */}
                        {currentContext === "default" && (
                          <SpeedDial
                            position="bottom-right"
                            variant="primary"
                            size="lg"
                            direction="up"
                            labels={true}
                            icon={<Plus />}
                            mainLabel="Create"
                            actions={[
                              { icon: <Edit />, label: "Write Post", onClick: () => {} },
                              { icon: <Wrench />, label: "Add Tool", onClick: () => {} },
                              { icon: <MessageSquare />, label: "Ask Question", onClick: () => {} }
                            ]}
                          />
                        )}
                        
                        {currentContext === "dashboard" && (
                          <SpeedDial
                            position="bottom-right"
                            variant="primary"
                            size="lg"
                            direction="up"
                            labels={true}
                            icon={<Plus />}
                            mainLabel="Create"
                            actions={[
                              { icon: <Edit />, label: "Write Post", onClick: () => {} },
                              { icon: <Wrench />, label: "Add Tool", onClick: () => {} },
                              { icon: <MessageSquare />, label: "Ask Question", onClick: () => {} }
                            ]}
                          />
                        )}
                        
                        {currentContext === "profile" && (
                          <FloatingActionButton
                            position="bottom-right"
                            size="lg"
                            variant="primary"
                            icon={<Settings />}
                            extended
                            label="Settings"
                            onClick={() => {}}
                          />
                        )}
                        
                        {currentContext === "tools" && (
                          <FloatingActionButton
                            position="bottom-right"
                            size="lg"
                            variant="primary"
                            icon={<Plus />}
                            extended
                            label="Add Tool"
                            onClick={() => {}}
                          />
                        )}
                        
                        {currentContext === "topics" && (
                          <SpeedDial
                            position="bottom-right"
                            variant="primary"
                            size="lg"
                            direction="up"
                            labels={true}
                            icon={<Plus />}
                            mainLabel="Create"
                            actions={[
                              { icon: <Edit />, label: "New Topic", onClick: () => {} },
                              { icon: <Heart />, label: "Follow Topic", onClick: () => {}, variant: "accent" }
                            ]}
                          />
                        )}
                        
                        {currentContext === "create" && (
                          <SpeedDial
                            position="bottom-right"
                            variant="primary"
                            size="lg"
                            direction="up"
                            labels={true}
                            icon={<Send />}
                            mainLabel="Publish"
                            actions={[
                              { icon: <Share2 />, label: "Share Draft", onClick: () => {}, variant: "secondary" }
                            ]}
                          />
                        )}
                        
                        {currentContext === "view" && (
                          <SpeedDial
                            position="bottom-right"
                            variant="primary"
                            size="lg"
                            direction="up"
                            labels={true}
                            icon={<Heart />}
                            mainLabel="Like"
                            actions={[
                              { icon: <MessageSquare />, label: "Comment", onClick: () => {}, variant: "secondary" },
                              { icon: <Share2 />, label: "Share", onClick: () => {}, variant: "accent" }
                            ]}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </section>
                
                <div className="flex justify-center pt-8">
                  <Button asChild>
                    <a href="/design-system">Back to Design System</a>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveContainer>
    </div>
  )
}