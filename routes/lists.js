import express from 'express';
import { saveList, getList, removeList } from '../controllers/lists.js';

const router = express.Router();
router.post('/saveList', saveList);
router.get('/:userId/getList', getList);
router.delete('/:listId/removeList', removeList);
export default router
