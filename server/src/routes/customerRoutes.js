import express from 'express';
import {
  listCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  archiveCustomer,
} from '../controllers/customerController.js';
import {
  listNotes,
  createNote,
  deleteNote,
  getActivityTimeline,
} from '../controllers/customerNoteController.js';
import { requireAuth, resolveActiveBusiness, requireBusiness } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createCustomerValidator,
  updateCustomerValidator,
  createNoteValidator,
} from '../validators/customerValidators.js';

const router = express.Router();

// Enforce auth & active workspace tenant isolation
router.use(requireAuth, resolveActiveBusiness, requireBusiness);

// Customer CRUD
router.get('/', listCustomers);
router.post('/', validate(createCustomerValidator), createCustomer);
router.get('/:customerId', getCustomerById);
router.patch('/:customerId', validate(updateCustomerValidator), updateCustomer);
router.delete('/:customerId', archiveCustomer);

// Customer Notes
router.get('/:customerId/notes', listNotes);
router.post('/:customerId/notes', validate(createNoteValidator), createNote);
router.delete('/:customerId/notes/:noteId', deleteNote);

// Customer Activity
router.get('/:customerId/activity', getActivityTimeline);

export default router;
