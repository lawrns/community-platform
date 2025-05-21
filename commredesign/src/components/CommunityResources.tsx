import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardImage } from './ui/Card';
import { resources } from '../data/mockData';
import Badge from './ui/Badge';
import { BookOpen, FileText, Video, GraduationCap as Graduation, PenTool as Tool, Book } from 'lucide-react';
import { ResourceType } from '../types';

const CommunityResources: React.FC = () => {
  const resourceIcons = {
    [ResourceType.Tutorial]: <BookOpen size={16} />,
    [ResourceType.Paper]: <FileText size={16} />,
    [ResourceType.Video]: <Video size={16} />,
    [ResourceType.Course]: <Graduation size={16} />,
    [ResourceType.Tool]: <Tool size={16} />,
    [ResourceType.Book]: <Book size={16} />
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Learning Resources</h2>
            <p className="text-gray-600 mt-2">Expand your AI knowledge with these community-curated resources</p>
          </div>
          <a href="/resources" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
            Browse All Resources
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} hoverable className="h-full flex flex-col">
              <CardImage 
                src={resource.thumbnail} 
                alt={resource.title}
                aspectRatio="video"
              />
              
              <CardHeader className="pb-2">
                <div className="flex items-center gap-1 mb-2">
                  <Badge variant="default" size="sm" className="flex items-center gap-1">
                    {resourceIcons[resource.type]}
                    {resource.type}
                  </Badge>
                </div>
                
                <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                  {resource.title}
                </h3>
              </CardHeader>
              
              <CardContent className="pt-0 pb-3 flex-grow">
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                  {resource.description}
                </p>
                
                <div className="flex items-center mt-auto pt-2 text-xs text-gray-500">
                  <span>By {resource.author}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(resource.publishedDate).toLocaleDateString('en-US', { 
                    year: 'numeric',
                    month: 'short',
                  })}</span>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
                >
                  View Resource
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityResources;