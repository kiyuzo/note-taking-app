import React from 'react';

const Sidebar = ({ accountName, accountEmail, onNewNote, onSearch, notes }) => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">{accountName}</h2>
        <p className="text-sm">{accountEmail}</p>
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
        <h3 className="text-lg font-bold mb-2">Notes</h3>
        <ul>
          {notes.map((note) => (
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