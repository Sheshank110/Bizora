import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileValidator, changePasswordValidator } from '../validators/authValidators.js';

const router = express.Router();

router.use(requireAuth);

router.get('/me', getProfile);
router.patch('/profile', validate(updateProfileValidator), updateProfile);
router.put('/password', validate(changePasswordValidator), changePassword);

export default router;
