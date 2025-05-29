import React, { useEffect, useState } from 'react';

interface HeroProps {
  backgroundImage: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

const Hero: React.FC<HeroProps> = ({ backgroundImage, title, subtitle, children }) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden -mt-16 pt-16">
      {/* Enhanced background with parallax effect */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          transform: `scale(${1 + scrollPosition * 0.0005})`,
          zIndex: 1,
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" style={{ zIndex: 2 }}></div>

        {/* Subtle animated particles */}
        <div className="absolute inset-0 opacity-20" style={{ zIndex: 3 }}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content with fade-in effect */}
      <div className="relative text-center text-white px-4" style={{ zIndex: 10 }}>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 opacity-100 transition-all duration-1000 ease-out delay-300">
          {title}
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl font-light opacity-100 transition-all duration-1000 ease-out delay-500">
          {subtitle}
        </p>

        {/* Render children here (e.g., button) */}
        <div className="mt-8 relative opacity-100 transition-all duration-1000 ease-out delay-700" style={{ zIndex: 11 }}>
          {children}
        </div>
      </div>

      {/* Enhanced scroll down indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center" style={{ zIndex: 10 }}>
        <div className="animate-bounce flex flex-col items-center">
          <span className="text-sm mb-2 opacity-80 text-white">Scroll</span>
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
    </div>
  );
};

export default Hero;