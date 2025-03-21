"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/_components/navbar';
import dynamic from 'next/dynamic';
import { EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import Footer from '@/_components/footer';

const Editor = dynamic(() => import('draft-js').then(mod => mod.Editor), { ssr: false });

export default function EditNote() {
  const [title, setTitle] = useState('');
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isFolder, setIsFolder] = useState(false);
  const [parentFolder, setParentFolder] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [user, setUser] = useState({ user_id: '', username: '', email: '' });
  const router = useRouter();
  const { id } = useParams();

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
          setUser({ user_id: data.user_id, username: data.username, email: data.email });
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('An error occurred while fetching user data', error);
      }
    };

    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/1.0/notes/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setTitle(data.title || '');
          setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(data.content))));
          setTags(data.tags || []);
          setIsFolder(data.isFolder || false);
          setParentFolder(data.parentFolder || '');
          setIsPinned(data.isPinned || false);
        } else {
          console.error('Failed to fetch note data');
        }
      } catch (error) {
        console.error('An error occurred while fetching note data', error);
      }
    };

    fetchUser();
    fetchNote();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const contentState = editorState.getCurrentContent();
    const content = JSON.stringify(convertToRaw(contentState));

    const updatedNote = {
      title,
      content,
      tags,
      isFolder,
      parentFolder: parentFolder || null
    };

    try {
      if(isPinned) {
        await fetch(`/api/1.0/notes/${id}/pin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        await fetch(`/api/1.0/notes/${id}/pin`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      const response = await fetch(`/api/1.0/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNote),
      });

      if (response.ok) {
        console.log('Note updated with ID:', id);
        // Redirect to the dashboard
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        console.error('Failed to update note', errorData);
      }
    } catch (error) {
      console.error('An error occurred while updating the note', error);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const onTab = (e) => {
    const maxDepth = 4;
    setEditorState(RichUtils.onTab(e, editorState, maxDepth));
  };

  const toggleInlineStyle = (inlineStyle) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="p-4 flex-grow">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Edit Note</h2>
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
            <div className="border p-2 rounded">
              <div className="mb-2 flex space-x-2">
                <button type="button" onClick={() => toggleInlineStyle('BOLD')} className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" style={{ color: 'black' }}>
                    <path strokeLinejoin="round" d="M6.75 3.744h-.753v8.25h7.125a4.125 4.125 0 0 0 0-8.25H6.75Zm0 0v.38m0 16.122h6.747a4.5 4.5 0 0 0 0-9.001h-7.5v9h.753Zm0 0v-.37m0-15.751h6a3.75 3.75 0 1 1 0 7.5h-6m0-7.5v7.5m0 0v8.25m0-8.25h6.375a4.125 4.125 0 0 1 0 8.25H6.75m.747-15.38h4.875a3.375 3.375 0 0 1 0 6.75H7.497v-6.75Zm0 7.5h5.25a3.75 3.75 0 0 1 0 7.5h-5.25v-7.5Z" />
                  </svg>
                </button>
                <button type="button" onClick={() => toggleInlineStyle('ITALIC')} className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" style={{ color: 'black' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.248 20.246H9.05m0 0h3.696m-3.696 0 5.893-16.502m0 0h-3.697m3.697 0h3.803" />
                  </svg>
                </button>
                <button type="button" onClick={() => toggleInlineStyle('UNDERLINE')} className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" style={{ color: 'black' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.995 3.744v7.5a6 6 0 1 1-12 0v-7.5m-2.25 16.502h16.5" />
                  </svg>
                </button>
              </div>
              <div style={{ color: 'black' }}>
                <Editor
                  editorState={editorState}
                  handleKeyCommand={handleKeyCommand}
                  onTab={onTab}
                  onChange={setEditorState}
                  placeholder="Write your note..."
                  spellCheck={true}
                  className="editor-content"
                />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">
              Tags
            </label>
            <div className="flex items-center">
              <input
                type="text"
                id="tagInput"
                className="shadow appearance-none border rounded w-2/3 md:w-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={tagInput}
                onChange={handleTagInputChange}
              />
              <button type="button" onClick={handleAddTag} className="ml-2 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold px-6 md:px-8 text-sm rounded focus:outline-none focus:shadow-outline whitespace-nowrap">
                Add Tag
              </button>
            </div>
            <div className="mt-2">
              {tags.map((tag, index) => (
                <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(index)} className="ml-2 text-red-500">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="isFolder">
              Is Folder
            </label>
            <input
              type="checkbox"
              id="isFolder"
              className="mr-2 leading-tight"
              checked={isFolder}
              onChange={(e) => setIsFolder(e.target.checked)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="parentFolder">
              Parent Folder
            </label>
            <input
              type="text"
              id="parentFolder"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={parentFolder}
              onChange={(e) => setParentFolder(e.target.value)}
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
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}