import { body, param } from 'express-validator';
import { BUSINESS_TYPES, USER_ROLES, DEFAULT_CURRENCIES } from '../constants/index.js';

export const createBusinessValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Business name is required')
    .isLength({ max: 100 })
    .withMessage('Business name cannot exceed 100 characters'),
  body('industry')
    .optional()
    .isIn(BUSINESS_TYPES)
    .withMessage(`Industry must be one of: ${BUSINESS_TYPES.join(', ')}`),
  body('currency')
    .optional()
    .isIn(DEFAULT_CURRENCIES)
    .withMessage(`Currency must be one of: ${DEFAULT_CURRENCIES.join(', ')}`),
  body('timezone')
    .optional()
    .trim(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }),
];

export const updateBusinessValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Business name cannot be empty')
    .isLength({ max: 100 }),
  body('industry')
    .optional()
    .isIn(BUSINESS_TYPES),
  body('currency')
    .optional()
    .isIn(DEFAULT_CURRENCIES),
  body('timezone')
    .optional()
    .trim(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }),
  body('address')
    .optional()
    .isObject(),
  body('contact')
    .optional()
    .isObject(),
  body('taxId')
    .optional()
    .trim(),
];

export const inviteMemberValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(Object.values(USER_ROLES))
    .withMessage(`Role must be one of: ${Object.values(USER_ROLES).join(', ')}`),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }),
];

export const updateMemberRoleValidator = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(Object.values(USER_ROLES))
    .withMessage(`Role must be one of: ${Object.values(USER_ROLES).join(', ')}`),
  body('title')
    .optional()
    .trim(),
  body('department')
    .optional()
    .trim(),
];
