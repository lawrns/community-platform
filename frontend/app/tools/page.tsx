"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ChevronDown, Loader2 } from 'lucide-react'
import MotionWrapper from '@/components/motion/MotionWrapper'
import ToolCard from '@/components/tools/ToolCard'
import { api } from '@/lib/api'
import { Tool } from '@/lib/types'
import { useToast } from '@/components/ui/use-toast'

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [filterOpen, setFilterOpen] = useState(false)
  const [priceFilter, setPriceFilter] = useState("All")
  const [ratingFilter, setRatingFilter] = useState(0)
  const { toast } = useToast()
  
  // Fetch tools and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch tools
        const toolsResponse = await api.tools.listTools({})
        setTools(toolsResponse.tools || [])
        
        // Fetch categories
        const categoriesResponse = await api.tools.getToolCategories()
        setCategories(["All Categories", ...(categoriesResponse.categories || [])])
      } catch (error) {
        console.error('Error fetching tools:', error)
        toast({
          title: "Error",
          description: "Failed to load tools. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [toast])
  
  // Handle search input changes with debounce
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          setLoading(true)
          const response = await api.tools.listTools({ 
            search: searchQuery,
            category: selectedCategory !== "All Categories" ? selectedCategory : undefined,
            pricing: priceFilter !== "All" ? priceFilter.toLowerCase() : undefined,
            min_rating: ratingFilter > 0 ? ratingFilter : undefined
          })
          setTools(response.tools || [])
        } catch (error) {
          console.error('Error searching tools:', error)
        } finally {
          setLoading(false)
        }
      }
    }, 300)
    
    return () => clearTimeout(handler)
  }, [searchQuery])
  
  // Handle filter changes
  const applyFilters = async () => {
    try {
      setLoading(true)
      const response = await api.tools.listTools({
        search: searchQuery,
        category: selectedCategory !== "All Categories" ? selectedCategory : undefined,
        pricing: priceFilter !== "All" ? priceFilter.toLowerCase() : undefined,
        min_rating: ratingFilter > 0 ? ratingFilter : undefined
      })
      setTools(response.tools || [])
    } catch (error) {
      console.error('Error applying filters:', error)
      toast({
        title: "Error",
        description: "Failed to apply filters. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Apply filters when they change
  useEffect(() => {
    if (!loading) {
      applyFilters()
    }
  }, [selectedCategory, priceFilter, ratingFilter])
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All Categories")
    setPriceFilter("All")
    setRatingFilter(0)
  }
  
  // Animation variants for list items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <MotionWrapper>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI Tool Directory</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover and explore the latest AI tools with reviews and ratings from the community.
          </p>
        </div>
      </MotionWrapper>
      
      {/* Search and Filter Section */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <MotionWrapper delay={0.1} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for tools, categories, or companies..."
                className="w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            </div>
          </MotionWrapper>
          
          <MotionWrapper delay={0.2} className="w-full md:w-64">
            <div className="relative">
              <select
                className="w-full px-4 py-3 appearance-none border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-3.5 text-gray-400" size={20} />
            </div>
          </MotionWrapper>
          
          <MotionWrapper delay={0.3}>
            <button 
              className="px-4 py-3 border rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter size={20} />
              Filters
              <ChevronDown 
                size={16} 
                className={`transform transition-transform ${filterOpen ? 'rotate-180' : ''}`} 
              />
            </button>
          </MotionWrapper>
        </div>
        
        {/* Advanced Filters */}
        {filterOpen && (
          <motion.div 
            className="p-6 border rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <h3 className="font-medium mb-3">Price</h3>
              <div className="space-y-2">
                {["All", "Free", "Freemium", "Paid"].map(price => (
                  <label key={price} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceFilter === price}
                      onChange={() => setPriceFilter(price)}
                      className="text-primary focus:ring-primary"
                    />
                    {price}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Minimum Rating</h3>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={ratingFilter}
                onChange={e => setRatingFilter(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Any</span>
                <span>{ratingFilter > 0 ? `${ratingFilter}+` : 'Any'}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading tools...</span>
        </div>
      )}
      
      {/* Tools Grid */}
      {!loading && tools.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {tools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </motion.div>
      ) : !loading && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 dark:text-gray-400">No tools found matching your criteria.</p>
          <button 
            className="mt-4 text-primary hover:underline"
            onClick={clearFilters}
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}