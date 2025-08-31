import { useState, useEffect } from 'react';
import API from '../services/authService';

interface NoteType {
  _id: string;
  title: string;
  content: string;
  user: string;
  createdAt: string;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const res = await API.get<NoteType[]>('/notes', {
        headers: { 'x-auth-token': token },
      });

      setNotes(res.data);

      // Extract user info from first note or localStorage if available
      if (res.data.length > 0) {
        setUserName(res.data[0].user);
        setUserEmail(localStorage.getItem('userEmail') || '');
      }
    } catch (err: any) {
      setError('Failed to fetch notes.');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotes();
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    if (name) setUserName(name);
    if (email) setUserEmail(email);
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await API.post<NoteType>(
        '/notes',
        { title, content },
        { headers: { 'x-auth-token': token } }
      );
      setNotes([res.data, ...notes]);
      setTitle('');
      setContent('');
      setShowModal(false);
      setError('');
    } catch (err: any) {
      setError('Failed to create note.');
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/notes/${noteId}`, { headers: { 'x-auth-token': token } });
      setNotes(notes.filter((note) => note._id !== noteId));
      setError('');
    } catch (err: any) {
      setError('Failed to delete note.');
      console.error(err);
    }
  };

  return (
    <div className="notes-page-container">
      {/* Header */}
      <header className="notes-header">
        <img src="/images/logo.png" alt="HD Logo" className="logo" />
        <h1 className="dashboard-title">Dashboard</h1>
      </header>

      {/* Welcome Card */}
      <div className="welcome-card">
        <h2>Welcome, {userName}</h2>
        <p>{userEmail}</p>
      </div>

      {/* Create Note Button */}
      <button className="primary-button create-note-btn" onClick={() => setShowModal(true)}>
        Create Note
      </button>

      {/* Notes Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create a New Note</h3>
            <form onSubmit={handleCreateNote} className="modal-form">
              <div className="modal-form-group">
                <label htmlFor="title">Title:</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="modal-input"
                />
              </div>
              <div className="modal-form-group">
                <label htmlFor="content">Content:</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="modal-textarea"
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="primary-button">
                  Add Note
                </button>
                <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes List */}
      <h2 className="notes-heading">Notes</h2>
      {error && <p className="error-msg">{error}</p>}
      <div className="notes-list">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note._id} className="note-card">
              <div className="note-card-header">
                <h3>{note.title}</h3>
                <button onClick={() => handleDeleteNote(note._id)} className="delete-btn">
                  &times;
                </button>
              </div>
              <p>{note.content}</p>
            </div>
          ))
        ) : (
          <p>You have no notes yet. Create one above!</p>
        )}
      </div>
    </div>
  );
};

export default Notes;
