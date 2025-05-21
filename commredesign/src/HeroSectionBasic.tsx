import React from 'react';

const HeroSectionBasic = () => {
  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center">
      {/* Static background with gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-purple-900 to-gray-950 opacity-90 z-0"></div>
        
        {/* Add some texture with a static noise pattern */}
        <div 
          className="absolute inset-0 opacity-40 mix-blend-soft-light"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Vignette overlay for depth */}
        <div 
          className="absolute inset-0 z-1" 
          style={{ 
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,.85), rgba(0,0,0,0) 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,.85), rgba(0,0,0,0) 80%)',
            backgroundColor: 'rgba(0,0,0,0.25)'
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge / Tag */}
          <div className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-purple-900/60 text-purple-200 border border-purple-700/50 backdrop-blur-sm mb-8">
            <span className="mr-1">✨</span>
            Empower Your AI Journey
          </div>
          
          {/* Main Heading */}
          <h1 className="mt-8 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
            <span className="block">Unite.</span>
            <span className="block">Learn.</span>
            <span className="block">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Build
              </span>
              <span> with AI.</span>
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Join a thriving community to collaborate, discover tools, and accelerate your AI expertise.
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#" 
              className="inline-flex items-center justify-center rounded-md font-medium h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-shadow"
            >
              <span className="mr-2">👥</span>
              Join the Community
            </a>
            
            <a 
              href="#"
              className="inline-flex items-center justify-center rounded-md font-medium h-12 px-6 text-gray-200 border border-gray-600 bg-transparent hover:bg-gray-800"
            >
              Explore AI Tools
              <span className="ml-2">→</span>
            </a>
          </div>
          
          {/* Social Proof */}
          <div className="mt-3">
            <p className="text-sm text-gray-400 mt-2">
              <span className="text-blue-400 font-medium">100,000+</span> members from 182 countries
            </p>
          </div>
          
          {/* Live Counter */}
          <div className="mt-8">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-gray-300">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              <span>127 questions answered in the last 24h</span>
            </div>
          </div>
          
          {/* Down Arrow */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-70"
            >
              <path 
                d="M12 5L12 19M12 19L19 12M12 19L5 12" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionBasic;