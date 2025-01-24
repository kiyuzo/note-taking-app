"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../_components/navbar';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date');
  const router = useRouter();

  useEffect(() => {
    const fetchNotes = () => {
      const storedNotes = JSON.parse(localStorage.getItem('notes')) || [];
      setNotes(storedNotes);
    };

    fetchNotes();
  }, []);

  const filteredNotes = notes
    .filter((note) =>
      search
        ? note.title.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .sort((a, b) => {
      if (sort === 'date') return new Date(b.updated_at) - new Date(a.updated_at);
      if (sort === 'alphabetical') return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search notes..."
            className="border p-2 rounded"
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border p-2 rounded"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="alphabetical">Sort Alphabetically</option>
          </select>
          <a
            href="/create-note"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Create Note
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.note_id}
              className="p-4 border rounded cursor-pointer"
              onClick={() => router.push(`/notes/${note.note_id}/view`)}
            >
              <h2 className="text-lg font-bold">{note.title}</h2>
              <p className="text-sm text-gray-600">
                {note.content.slice(0, 100)}...
              </p>
              <p className="text-xs text-gray-500">
                Last Modified: {new Date(note.updated_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}