import { Router } from 'express';
import SupportController from './support.controller';
import { authenticate, adminAuthRequired, requireAdmin } from '../../middlewares/validate.middleware';


const router = Router();

// User routes
router.post('/', authenticate, SupportController.createTicket);
router.get('/mine', authenticate, SupportController.getMyTickets);

// Admin routes
router.get('/', adminAuthRequired, requireAdmin, SupportController.getAllTickets);
router.put('/:id/resolve', adminAuthRequired, requireAdmin, SupportController.resolveTicket);

export default router;
