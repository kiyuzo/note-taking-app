"use client";

import React, { useEffect, useState } from 'react';

const Hero = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/1.0/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('An error occurred while checking login status', error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <div className="relative h-[90vh] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/hero-bg.png')" }}>
      <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-sm"></div>
      <div className="relative container mx-auto px-4 text-center text-white">
        {isLoggedIn ? (
          <>
            <h1 className="text-5xl font-bold mb-4">Welcome to Note-Taking App</h1>
            <p className="text-xl mb-8">Go to the notes dashboard to organize your thoughts and ideas in one place.</p>
            <a
              href="/dashboard"
              className="bg-white text-blue-500 font-bold py-2 px-4 rounded hover:bg-gray-200"
            >
              Go to Dashboard
            </a>
          </>
        ) : (
          <>
            <h1 className="text-5xl font-bold mb-4">Welcome to Note-Taking App</h1>
            <p className="text-xl mb-8">Create a free account to organize your thoughts and ideas in one place.</p>
            <a
              href="/register"
              className="bg-white text-blue-500 font-bold py-2 px-4 rounded hover:bg-gray-200"
            >
              Get Started
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default Hero;