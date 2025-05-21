import React from 'react';
import Button from './ui/Button';
import { Check, ChevronRight } from 'lucide-react';

const JoinCommunity: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 opacity-95 z-0"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBhNiA2IDAgMTAtMTIgMCA2IDYgMCAwMDEyIDB6bTAtMzBhNiA2IDAgMTAtMTIgMCA2IDYgMCAwMDEyIDB6TTYgMGE2IDYgMCAxMC0xMiAwIDYgNiAwIDAwMTIgMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10 z-0"></div>
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-white rounded-full opacity-10 filter blur-3xl"></div>
      <div className="absolute bottom-0 right-0 transform translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white rounded-full opacity-10 filter blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Join the leading community of AI enthusiasts</h2>
          <p className="mt-4 text-lg md:text-xl text-white/80">
            Connect with like-minded individuals, share your knowledge, and accelerate your AI journey.
          </p>
          
          <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center mb-4">
                <Check className="text-green-400" size={20} />
              </div>
              <h3 className="text-xl font-semibold text-white">Share Knowledge</h3>
              <p className="mt-2 text-white/70">
                Exchange ideas and insights with experts and practitioners across various AI disciplines.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center mb-4">
                <Check className="text-green-400" size={20} />
              </div>
              <h3 className="text-xl font-semibold text-white">Build Together</h3>
              <p className="mt-2 text-white/70">
                Collaborate on innovative AI projects with talent from around the world.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center mb-4">
                <Check className="text-green-400" size={20} />
              </div>
              <h3 className="text-xl font-semibold text-white">Grow Skills</h3>
              <p className="mt-2 text-white/70">
                Access curated resources and mentorship opportunities to accelerate your learning.
              </p>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              Join Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white/10"
              rightIcon={<ChevronRight size={18} />}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinCommunity;