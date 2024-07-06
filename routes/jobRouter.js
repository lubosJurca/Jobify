import { Router } from 'express';
import { checkForTestUser } from '../middleware/authMiddleware.js';
import {
  getAllJobs,
  createJob,
  getSingleJob,
  editJob,
  deleteJob,
  showStats,
} from '../controllers/jobController.js';
import {
  validateJobInput,
  validateIdParam,
} from '../middleware/validationMiddleware.js';
const router = Router();

router.get('/', getAllJobs);
router.post('/', checkForTestUser, validateJobInput, createJob);

router.route('/stats').get(showStats);

router.get('/:id', validateIdParam, getSingleJob);
router.patch(
  '/:id',
  checkForTestUser,
  validateIdParam,
  validateJobInput,
  editJob
);
router.delete('/:id', checkForTestUser, validateIdParam, deleteJob);

export default router;
