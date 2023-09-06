import express from 'express';
import { postComments, getComments, addLikes } from '../controllers/StorageAPI.js';



const router = express.Router()

router.post("/post", postComments)
router.get("/get", getComments)
router.patch("/patch", addLikes)


export default router
