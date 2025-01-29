import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <div className="text-white text-2xl">
        <a href="/">Notes</a>
      </div>
      <ul className="flex space-x-4">
        <li>
          <a href="/dashboard" className="text-white hover:underline">Dashboard</a>
        </li>
        <div className='flex space-x-4'>
            <li>
                <a href="/login" className="text-white hover:underline">Login</a>
            </li>
            <li>
                <a href="/register" className="text-white hover:underline">Register</a>
            </li>
        </div>
      </ul>
    </nav>
  );
};

export default Navbar;