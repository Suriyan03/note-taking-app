import { useState, useEffect } from 'react';
import API from '../services/authService';
import { useNavigate } from 'react-router-dom';

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
  const [user, setUser] = useState<{ name: string; email: string }>({ name: '', email: '' });
  const navigate = useNavigate();

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const res = await API.get<NoteType[]>('/notes', {
        headers: { 'x-auth-token': token },
      });

      setNotes(res.data);
    } catch (err: any) {
      setError('Failed to fetch notes.');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const userPayload = JSON.parse(window.atob(base64));
        setUser({ name: userPayload.user.name, email: userPayload.user.email }); // Extract from token payload
      } catch (e) {
        console.error("Failed to decode JWT token");
      }
    }

    fetchNotes();
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
        <div className="logo">
          <img src="/images/logo.png" alt="HD Logo" style={{ width: '30px', height: '30px', marginLeft: '-5rem', marginTop: '' }} />
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Welcome Card */}
      <div className="welcome-card">
        <h2>Welcome, {user.name}</h2>
        <p>{user.email}</p>
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
          <p className="empty-notes-message">You have no notes yet. Create one above!</p>
        )}
      </div>
    </div>
  );
};

export default Notes;