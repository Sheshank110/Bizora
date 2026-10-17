import { body } from 'express-validator';
import { USER_ROLES } from '../constants/index.js';
import { EMPLOYEE_STATUS } from '../models/EmployeeProfile.js';

export const inviteEmployeeValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid work email')
    .normalizeEmail(),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .customSanitizer((v) => (v ? v.toLowerCase() : v))
    .isIn(['manager', 'employee'])
    .withMessage('Role must be Manager or Employee'),
  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }),
];

export const updateEmployeeValidator = [
  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('phone')
    .optional()
    .trim(),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }),
  body('status')
    .optional()
    .isIn(Object.values(EMPLOYEE_STATUS))
    .withMessage(`Status must be one of: ${Object.values(EMPLOYEE_STATUS).join(', ')}`),
  body('role')
    .optional()
    .customSanitizer((v) => (v ? v.toLowerCase() : v))
    .isIn(['manager', 'employee'])
    .withMessage('Role must be Manager or Employee'),
];
