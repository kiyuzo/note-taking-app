"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../_components/sidebar';
import { convertFromRaw, EditorState } from 'draft-js';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [sort, setSort] = useState('date');
  const [user, setUser] = useState({ username: '', email: '' });
  const router = useRouter();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/1.0/notes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setNotes(data || []);
        } else {
          console.error('Failed to fetch notes');
        }
      } catch (error) {
        console.error('An error occurred while fetching notes', error);
      }
    };

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

    fetchNotes();
    fetchUser();
  }, []);

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  const handleNewNote = () => {
    router.push('/create-note');
  };

  const handleDeleteNote = async (noteId) => {
    const confirmed = window.confirm('Are you sure you want to delete this note?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/1.0/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedNotes = notes.filter(note => note.nID !== noteId);
        setNotes(updatedNotes);
      } else {
        console.error('Failed to delete note');
      }
    } catch (error) {
      console.error('An error occurred while deleting the note', error);
    }
  };

  const isValidJson = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  const convertContentToPlainText = (content) => {
    if (!isValidJson(content)) {
      return content;
    }
    try {
      const contentState = convertFromRaw(JSON.parse(content));
      const editorState = EditorState.createWithContent(contentState);
      return editorState.getCurrentContent().getPlainText();
    } catch (error) {
      console.error('Failed to convert content', error);
      return '';
    }
  };

  const filteredNotes = (notes || []).sort((a, b) => {
    if (sort === 'date') {
      return new Date(b.updated_at) - new Date(a.updated_at);
    } else if (sort === 'alphabetical') {
      return a.title.localeCompare(b.title);
    } else if (sort === 'tags') {
      return a.tags.join(', ').localeCompare(b.tags.join(', '));
    }
    return 0;
  });

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar
        accountName={user.username}
        accountEmail={user.email}
        onNewNote={handleNewNote}
        notes={notes}
      />
      <div className="flex-grow p-4">
        <div className="flex justify-end items-center mb-4">
          <select
            value={sort}
            onChange={handleSortChange}
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="date">Sort by Date</option>
            <option value="alphabetical">Sort Alphabetically</option>
            <option value="tags">Sort by Tags</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div key={note.nID} className="border p-4 rounded shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-black">{note.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/edit-note/${note.nID}`)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 0 1 3.182 3.182L7.5 19.213l-4.5 1.5 1.5-4.5L16.862 3.487z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.nID)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 6.75L4.5 6.75m0 0L5.25 19.5a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25L19.5 6.75m-15 0L6 4.5a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 4.5l.75 2.25m-15 0h15" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-gray-700 mb-2">{convertContentToPlainText(note.content)}</p>
              <p className="text-gray-500 text-sm">Tags: {note.tags.join(', ')}</p>
              <p className="text-gray-500 text-sm">Updated: {new Date(note.updated_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}