import React from 'react';
import { users } from '../data/mockData';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { UserPlus, ExternalLink } from 'lucide-react';

const MemberShowcase: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Meet Our Community</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Connect with AI professionals, researchers, and enthusiasts from around the world
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {users.slice(0, 3).map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <Avatar 
                  src={user.avatar} 
                  alt={user.name} 
                  size="xl"
                  status="online" 
                />
                
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">@{user.username}</p>
                
                <Badge variant="default" size="sm" className="mt-3">
                  {user.expertise}
                </Badge>
                
                <p className="mt-4 text-sm text-gray-600 line-clamp-3">
                  {user.bio}
                </p>
                
                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  {user.interests.slice(0, 3).map((interest, index) => (
                    <Badge key={index} variant="outline" size="sm">
                      {interest}
                    </Badge>
                  ))}
                </div>
                
                <div className="mt-5 text-xs text-gray-500 flex items-center justify-center gap-4">
                  <div>
                    <span className="block font-semibold text-gray-700">{user.followers}</span>
                    <span>Followers</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-gray-700">{user.following}</span>
                    <span>Following</span>
                  </div>
                </div>
                
                <div className="mt-5 flex gap-2 w-full">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    leftIcon={<UserPlus size={14} />}
                    fullWidth
                  >
                    Follow
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    leftIcon={<ExternalLink size={14} />}
                  >
                    Profile
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            size="lg"
          >
            View All Members
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MemberShowcase;