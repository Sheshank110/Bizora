/**
 * Application-wide constants.
 * Centralized to avoid magic strings/numbers.
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION: 422,
  TOO_MANY: 429,
  INTERNAL: 500,
};

export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  MEMBER: 'member',
  CLIENT: 'client',
  VIEWER: 'viewer',
};

export const ROLE_HIERARCHY = [
  USER_ROLES.CLIENT,
  USER_ROLES.VIEWER,
  USER_ROLES.EMPLOYEE,
  USER_ROLES.MEMBER,
  USER_ROLES.MANAGER,
  USER_ROLES.ADMIN,
  USER_ROLES.OWNER,
];

export const USER_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  DEACTIVATED: 'deactivated',
};

export const MEMBERSHIP_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  INVITED: 'invited',
  SUSPENDED: 'suspended',
};

export const BUSINESS_TYPES = [
  'technology',
  'services',
  'retail',
  'consulting',
  'healthcare',
  'manufacturing',
  'agency',
  'other',
];

export const DEFAULT_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

