import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getPosts,
  getSavedPosts,
  getMyPosts,
  createPost,
  toggleLike,
  toggleSave,
  addComment,
  toggleResolved,
  deletePost,
} from '../controllers/postController.js';

const router = Router();
router.use(protect);

router.get('/', getPosts);
router.post('/', createPost);
router.get('/saved', getSavedPosts);
router.get('/mine', getMyPosts);
router.post('/:id/like', toggleLike);
router.post('/:id/save', toggleSave);
router.post('/:id/comments', addComment);
router.patch('/:id/resolve', toggleResolved);
router.delete('/:id', deletePost);

export default router;
