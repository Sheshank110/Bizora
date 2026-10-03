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
  MEMBER: 'member',
  VIEWER: 'viewer',
};

export const ROLE_HIERARCHY = [
  USER_ROLES.VIEWER,
  USER_ROLES.MEMBER,
  USER_ROLES.MANAGER,
  USER_ROLES.ADMIN,
  USER_ROLES.OWNER,
];
