import express from 'express';
import { registrarInstructorHandler } from '../controllers/instructorController';

const router = express.Router();

router.post('/', registrarInstructorHandler);

export default router;
