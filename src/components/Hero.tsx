import React from 'react'

interface HeroProps {
  backgroundImage: string
  title: string
  subtitle: string
}

const Hero: React.FC<HeroProps> = ({ backgroundImage, title, subtitle }) => {
  return (
    <div 
      className="relative h-screen flex items-center justify-center"
      style={{
        marginTop: '-64px', // Adjust this value based on navbar height to compensate for the fixed navbar
        paddingTop: '64px'  // Add padding top equal to navbar height
      }}
    >
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4">{title}</h1>
        <p className="text-xl md:text-2xl lg:text-3xl font-light">{subtitle}</p>
        
        {/* Call to action button */}
        <div className="mt-8">
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-md text-lg transition-colors shadow-lg">
            Pick a guide
          </button>
        </div>
      </div>
      
      {/* Scroll down indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10 animate-bounce">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 text-white" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 14l-7 7m0 0l-7-7m7 7V3" 
          />
        </svg>
      </div>
    </div>
  )
}

export default Hero