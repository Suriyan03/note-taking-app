import { Router, Request, Response } from 'express';
import auth from '../middleware/authMiddleware';
import { Note } from '../models/Note';

// Extend the Express Request interface for our middleware
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

const router = Router();

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post('/', auth, async (req: AuthenticatedRequest, res: Response) => {
  const { title, content } = req.body;
  
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: 'User not authenticated' });
    }

    const newNote = new Note({
      title,
      content,
      user: req.user.id,
    });

    const note = await newNote.save();
    res.json(note);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/notes
// @desc    Get all notes for an authenticated user
// @access  Private
router.get('/', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: 'User not authenticated' });
    }

    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a specific note
// @access  Private
router.delete('/:id', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const noteId = req.params.id;
    if (!noteId) {
      return res.status(400).json({ msg: 'Note ID is required' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: 'User not authenticated' });
    }
    
    // Find the note
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    // Check if the authenticated user is the owner of the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await note.deleteOne();

    res.json({ msg: 'Note removed' });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    res.status(500).send('Server Error');
  }
});

export default router;
