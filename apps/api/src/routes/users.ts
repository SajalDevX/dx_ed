import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updatePreferences,
  getEnrollments,
  getProgressOverview,
  getCertificates,
  getBadges,
  getDashboard,
  deleteAccount,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/preferences', updatePreferences);
router.get('/enrollments', getEnrollments);
router.get('/progress', getProgressOverview);
router.get('/certificates', getCertificates);
router.get('/badges', getBadges);
router.delete('/account', deleteAccount);

export default router;
