import React from 'react';

const Hero = () => {
  return (
    <div className="bg-blue-500 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Note-Taking App</h1>
        <p className="text-xl mb-8">Organize your thoughts and ideas in one place.</p>
        <a
          href="/register"
          className="bg-white text-blue-500 font-bold py-2 px-4 rounded hover:bg-gray-200"
        >
          Get Started
        </a>
      </div>
    </div>
  );
};

export default Hero;