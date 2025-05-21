import React from 'react';
import { Calendar, MapPin, Users, ArrowRight, Video } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter, CardImage } from './ui/Card';
import { events } from '../data/mockData';
import Button from './ui/Button';

const UpcomingEvents: React.FC = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
            <p className="text-gray-600 mt-2">Connect with the community at these upcoming AI events</p>
          </div>
          <a href="/events" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
            View All Events
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {events.slice(0, 2).map((event) => (
            <Card key={event.id} hoverable className="flex flex-col md:flex-row h-full">
              <CardImage 
                src={event.image} 
                alt={event.title}
                className="w-full md:w-40 lg:w-60 h-48 md:h-auto"
              />
              
              <div className="flex flex-col flex-grow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      {event.isVirtual ? <Video size={12} className="mr-1" /> : <MapPin size={12} className="mr-1" />}
                      {event.isVirtual ? 'Virtual' : 'In Person'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        year: 'numeric',
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.title}
                  </h3>
                </CardHeader>
                
                <CardContent className="py-2 flex-grow">
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {event.description}
                  </p>
                  
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-start text-sm">
                      <Calendar size={16} className="mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })} 
                        <span className="text-gray-500 ml-1">at {event.time}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-start text-sm">
                      <MapPin size={16} className="mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{event.location}</span>
                    </div>
                    
                    <div className="flex items-start text-sm">
                      <Users size={16} className="mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{event.attendees.toLocaleString()} attendees</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    rightIcon={<ArrowRight size={16} />}
                  >
                    Register Now
                  </Button>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;