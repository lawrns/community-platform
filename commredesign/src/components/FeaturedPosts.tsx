import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardImage } from './ui/Card';
import { posts } from '../data/mockData';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import { MessageSquare, Heart, Share2 } from 'lucide-react';

const FeaturedPosts: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Discussions</h2>
            <p className="text-gray-600 mt-2">Explore thought-provoking AI discussions from our community</p>
          </div>
          <a href="/explore" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
            View All Discussions
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Card key={post.id} hoverable>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <Avatar src={post.user.avatar} alt={post.user.name} size="sm" status="online" />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">{post.user.name}</h4>
                      <p className="text-xs text-gray-500">{post.user.expertise}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.content}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="default" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="border-t border-gray-100 mt-3">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                      <Heart size={16} />
                      <span className="text-xs">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
                      <MessageSquare size={16} />
                      <span className="text-xs">{post.comments}</span>
                    </button>
                  </div>
                  <button className="text-gray-500 hover:text-purple-500 transition-colors">
                    <Share2 size={16} />
                  </button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPosts;