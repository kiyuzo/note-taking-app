"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../_components/navbar';

export default function CreateNote() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [folder, setFolder] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate note creation
    const newNote = {
      note_id: Date.now().toString(), // Unique ID for the note
      user_id: 'dummy-user-id', // Replace with actual user ID in a real application
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim()),
      folder,
      is_pinned: isPinned,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store the note in localStorage
    const existingNotes = JSON.parse(localStorage.getItem('notes')) || [];
    existingNotes.push(newNote);
    localStorage.setItem('notes', JSON.stringify(existingNotes));

    // Redirect to the dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="p-4 flex-grow">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Note</h2>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
              Content
            </label>
            <textarea
              id="content"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="folder">
              Folder
            </label>
            <input
              type="text"
              id="folder"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="isPinned">
              Pin Note
            </label>
            <input
              type="checkbox"
              id="isPinned"
              className="mr-2 leading-tight"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}