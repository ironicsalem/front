import React, { useEffect, useState } from 'react'

interface HeroProps {
  backgroundImage: string
  title: string
  subtitle: string
}

const Hero: React.FC<HeroProps> = ({ backgroundImage, title, subtitle }) => {
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div 
      className="relative h-screen flex items-center justify-center overflow-hidden"
      style={{
        marginTop: '-64px',
        paddingTop: '64px'
      }}
    >
      {/* Enhanced background with parallax effect */}
      <div 
        className="absolute inset-0 z-0 transition-transform duration-700 ease-out"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `scale(${1 + scrollPosition * 0.0005})`,
          willChange: 'transform'
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10"></div>
        
        {/* Subtle animated particles */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Content with fade-in effect */}
      <div className="relative z-10 text-center text-white px-4">
        <h1 
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 animate-fadeInUp"
          style={{ animationDelay: '0.3s' }}
        >
          {title}
        </h1>
        <p 
          className="text-xl md:text-2xl lg:text-3xl font-light animate-fadeInUp"
          style={{ animationDelay: '0.6s' }}
        >
          {subtitle}
        </p>
      </div>
      
      {/* Enhanced scroll down indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
        <div className="animate-bounce-slow flex flex-col items-center">
          <span className="text-sm mb-2 opacity-80">Scroll</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-white opacity-90" 
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

      {/* Add these styles to your global CSS */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out forwards;
          opacity: 0;
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}

export default Hero