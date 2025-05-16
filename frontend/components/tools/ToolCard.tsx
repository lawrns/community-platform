"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Tool } from '@/lib/types';

export interface ToolCardProps {
  tool: Tool;
  index?: number;
}

export default function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: index * 0.1
      }
    }
  };

  return (
    <motion.div 
      variants={itemVariants}
      className="card-subtle rounded-lg overflow-hidden card-hoverable"
    >
      <Link href={`/tools/${tool.id}`}>
        <div className="aspect-video bg-gray-100 dark:bg-gray-800">
          <img 
            src={tool.logo_url || 'https://placehold.co/400x250'} 
            alt={tool.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-bold">{tool.name}</h3>
              <p className="text-sm text-gray-500">
                {tool.vendor_name || (tool.is_verified ? 'Verified Vendor' : 'Community Submission')}
              </p>
            </div>
            {tool.primary_tag && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {tool.primary_tag}
              </span>
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {tool.description}
          </p>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i}
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  className={`w-4 h-4 ${i < Math.floor(tool.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`}
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
              <span className="text-sm font-medium ml-1">{tool.rating || '0'}</span>
              <span className="text-xs text-gray-500">({tool.reviews_count || 0})</span>
            </div>
            <span className="text-sm font-medium">
              {tool.pricing_info?.type || 'Unknown'}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}