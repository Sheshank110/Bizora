import { body, query } from 'express-validator';
import { CUSTOMER_STATUS, CUSTOMER_SOURCE } from '../models/Customer.js';

export const createCustomerValidator = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array of strings'),
  body('status')
    .optional()
    .isIn(Object.values(CUSTOMER_STATUS))
    .withMessage(`Status must be one of: ${Object.values(CUSTOMER_STATUS).join(', ')}`),
  body('source')
    .optional()
    .isIn(Object.values(CUSTOMER_SOURCE))
    .withMessage(`Source must be one of: ${Object.values(CUSTOMER_SOURCE).join(', ')}`),
  body('assignedEmployee')
    .optional({ checkFalsy: true }),
  body('address')
    .optional()
    .isObject(),
];

export const updateCustomerValidator = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 50 }),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 50 }),
  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone number cannot be empty'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('status')
    .optional()
    .isIn(Object.values(CUSTOMER_STATUS)),
  body('source')
    .optional()
    .isIn(Object.values(CUSTOMER_SOURCE)),
  body('tags')
    .optional()
    .isArray(),
  body('assignedEmployee')
    .optional(),
];

export const createNoteValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Note content is required')
    .isLength({ max: 2000 })
    .withMessage('Note cannot exceed 2000 characters'),
];
