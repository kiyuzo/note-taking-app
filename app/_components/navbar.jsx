"use client";

import React, { useEffect, useState } from 'react';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showLogout, setShowLogout] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);

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
          const data = await response.json();
          setIsLoggedIn(true);
          setUsername(data.username);
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

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/1.0/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsLoggedIn(false);
        setUsername('');
        window.location.href = '/';
      } else {
        const errorData = await response.json();
        console.error('Failed to log out', errorData);
      }
    } catch (error) {
      console.error('An error occurred while logging out', error);
    }
  };

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <div className="text-white text-2xl">
        <a href="/">Notes</a>
      </div>
      <div className="md:hidden">
        <button
          onClick={() => setShowHamburger(!showHamburger)}
          className="text-white focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
        {showHamburger && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
            <ul className="space-y-2">
              <li>
                <a href="/dashboard" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Dashboard</a>
              </li>
              {isLoggedIn ? (
                <>
                  <li>
                    <span
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer"
                      onClick={() => setShowLogout(!showLogout)}
                    >
                      {username}
                    </span>
                    {showLogout && (
                      <div className="bg-white rounded-md shadow-lg py-2">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <a href="/login" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Login</a>
                  </li>
                  <li>
                    <a href="/register" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Register</a>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
      <ul className="hidden md:flex space-x-4">
        <li>
          <a href="/dashboard" className="text-white hover:underline">Dashboard</a>
        </li>
        {isLoggedIn ? (
          <div className="relative">
            <span
              className="text-white cursor-pointer hover:underline"
              onClick={() => setShowLogout(!showLogout)}
            >
              {username}
            </span>
            {showLogout && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <li>
              <a href="/login" className="text-white hover:underline">Login</a>
            </li>
            <li>
              <a href="/register" className="text-white hover:underline">Register</a>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;