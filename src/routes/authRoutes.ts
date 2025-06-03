import express from 'express';
import { loginInstructorHandler } from '../controllers/authController';

const router = express.Router();

router.post('/login', loginInstructorHandler); 

export default router;
