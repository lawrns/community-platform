import React, { useEffect } from 'react';
import HeroSectionBasic from './HeroSectionBasic';
import FeaturedPosts from './components/FeaturedPosts';
import UpcomingEvents from './components/UpcomingEvents';
import CommunityResources from './components/CommunityResources';
import MemberShowcase from './components/MemberShowcase';
import JoinCommunity from './components/JoinCommunity';
import Footer from './components/Footer';

function App() {
  // Force dark mode for the entire site
  useEffect(() => {
    document.body.className = 'bg-gray-950 text-white';
    
    // Clean up function
    return () => {
      document.body.className = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar replaced with a simple header for now */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-3 glass-effect">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="text-white font-bold text-xl">Community</span>
            </a>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-white">Features</a>
            <a href="#posts" className="text-white">Posts</a>
            <a href="#resources" className="text-white">Resources</a>
            <a href="#members" className="text-white">Members</a>
            <a href="#events" className="text-white">Events</a>
            <div className="ml-4">
              <button className="inline-flex items-center justify-center rounded-md font-medium h-10 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">Join Now</button>
            </div>
          </div>
          
          <div className="md:hidden">
            <button className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      <main>
        <HeroSectionBasic />
        <section id="features" className="py-20 bg-gradient-to-b from-gray-900 to-gray-950 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <div className="inline-block p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                <span className="h-5 w-5 text-white">✨</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Powerful Features for a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Thriving Community</span>
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                Our platform combines cutting-edge technology with thoughtful design to create the perfect environment for community growth.
              </p>
            </div>
            
            {/* Simplified feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {['Tools', 'Q&A', 'Feed', 'Learning', 'Community', 'Security'].map((feature, i) => (
                <div key={i} className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden backdrop-blur-md p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg mb-5">
                    <span className="text-white">✨</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature}</h3>
                  <p className="text-gray-300 flex-grow text-sm mb-4">
                    Powerful {feature.toLowerCase()} features for your AI journey and community experience.
                  </p>
                  <div>
                    <a href="#" className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                      Learn more →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <FeaturedPosts />
        <UpcomingEvents />
        <CommunityResources />
        <MemberShowcase />
        <JoinCommunity />
      </main>
      <Footer />
    </div>
  );
}

export default App;