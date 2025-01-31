"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../_components/navbar';
import dynamic from 'next/dynamic';
import { EditorState, RichUtils, convertToRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';

const Editor = dynamic(() => import('draft-js').then(mod => mod.Editor), { ssr: false });

export default function CreateNote() {
  const [title, setTitle] = useState('');
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [tags, setTags] = useState('');
  const [folder, setFolder] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [user, setUser] = useState({ user_id: '', username: '', email: '' });
  const router = useRouter();

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

    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const contentState = editorState.getCurrentContent();
    const content = JSON.stringify(convertToRaw(contentState));

    const newNote = {
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim()),
      is_folder: false,
      parent_folder: folder || null,
      owner: user.user_id,
    };

    try {
      const response = await fetch('/api/1.0/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });

      if (response.ok) {
        const createdNote = await response.json();
        console.log('Note created with ID:', createdNote.nID);
        // Redirect to the dashboard
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        console.error('Failed to create note', errorData);
      }
    } catch (error) {
      console.error('An error occurred while creating the note', error);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
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
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="attachments">
              Attach Files/Images
            </label>
            <input
              type="file"
              id="attachments"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              multiple
              onChange={handleFileChange}
            />
            <div className="mt-2">
              {attachments.map((file, index) => (
                <div key={index} className="mb-2">
                  {file.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-32 h-32 object-cover" />
                  ) : (
                    <div>
                      <p>{file.name}</p>
                      <p>{(file.size / 1024).toFixed(2)} KB</p>
                      <p>{file.type}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
    </div>
  );
}