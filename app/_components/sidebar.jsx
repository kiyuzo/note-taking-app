import React, { useState, useEffect } from 'react';

const Sidebar = ({ onNewNote, onSearch, notes }) => {
  const [user, setUser] = useState({ username: '', email: '' });
  const [pinnedNotes, setPinnedNotes] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/1.0/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUser({ username: data.username, email: data.email });
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('An error occurred while fetching user data', error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const pinned = notes.filter(note => note.is_pinned);
    setPinnedNotes(pinned);
  }, [notes]);

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <div className="mb-4">
        <a href="/" className="text-2xl font-bold text-white">Notes</a>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-bold">{user.username}</h2>
        <p className="text-sm">{user.email}</p>
      </div>
      <hr className="border-gray-600 mb-4" />
      <button
        onClick={onNewNote}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        New Note
      </button>
      <input
        type="text"
        placeholder="Search..."
        className="w-full p-2 rounded mb-4 text-black"
        onChange={(e) => onSearch(e.target.value)}
      />
      <hr className="border-gray-600 mb-4" />
      <div>
        <h3 className="text-lg font-bold mb-2">Pinned Notes</h3>
        <ul>
          {pinnedNotes.map((note) => (
            <li key={note.note_id} className="mb-2">
              {note.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;