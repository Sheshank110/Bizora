import express from 'express';
import {
  listEmployees,
  getEmployeeById,
  updateEmployee,
} from '../controllers/employeeController.js';
import { requireAuth, resolveActiveBusiness, requireBusiness, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateEmployeeValidator } from '../validators/employeeValidators.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();

router.use(requireAuth, resolveActiveBusiness, requireBusiness);

router.get('/', listEmployees);
router.get('/:employeeId', getEmployeeById);
router.patch(
  '/:employeeId',
  requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(updateEmployeeValidator),
  updateEmployee
);

export default router;
