import React from 'react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-transparent text-gray-300 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 via-gray-950/60 to-transparent -z-10"></div>
      
      {/* Glass overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-gray-900/20 -z-10"></div>
      
      {/* Footer content */}
      <div className="container mx-auto px-4 pt-16 pb-8 relative">
        {/* Scroll to top button */}
        <button
          className="absolute right-8 top-8 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:translate-y-[-5px] transition-transform"
          onClick={scrollToTop}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="text-lg font-bold text-white">Community.io</span>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              The premier community platform for AI enthusiasts, researchers, and professionals to connect, collaborate, and grow together.
            </p>
            <div className="flex space-x-4">
              {['Twitter', 'GitHub', 'LinkedIn', 'Instagram'].map((platform, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="text-gray-400 hover:text-white transition-colors hover:scale-110 inline-block"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          
          {['Community', 'Resources', 'Company'].map((section, sIndex) => (
            <div key={sIndex}>
              <h4 className="text-white font-semibold mb-4">{section}</h4>
              <ul className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <li key={i}>
                    <a 
                      href="#" 
                      className="text-gray-400 hover:text-white transition-colors text-sm hover:translate-x-1 inline-block"
                    >
                      {section} Link {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800/50 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            © 2025 Community.io. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>newsletter@community.io</span>
            </a>
            <p className="text-sm text-gray-400 flex items-center">
              Made with <span className="mx-1 text-red-500">❤</span> by the Community team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;