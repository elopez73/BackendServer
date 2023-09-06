import express from 'express';
import { register, login, logout } from '../controllers/auth.js';


const router = express.Router()
router.post("/register", register)
router.post("/:userEmail/login", login)
router.post("/:userEmail/logout", logout)

export default router
