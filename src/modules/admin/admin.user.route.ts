import { Router } from 'express';
import { adminAuthRequired, requireAdmin, requireSuperAdmin } from '../../middlewares/validate.middleware';
import { AdminUserController } from './admin.user.controller';

const router = Router();

// Step 1: Require a valid admin token
// Step 2: Ensure admin is active (not blocked)

// User Management Routes

// List all users — accessible to all active admins
router.get('/users', adminAuthRequired, requireAdmin, AdminUserController.listUsers);

// Get a single user by ID — accessible to all active admins
router.get('/users/:id', adminAuthRequired, requireAdmin, AdminUserController.getUser);

// Block or unblock a user — superadmins only
router.patch('/users/:id/block', adminAuthRequired, requireSuperAdmin, AdminUserController.blockUnblockUser);

// Suspend or activate a user — superadmins only
router.patch('/users/:id/suspend', adminAuthRequired, requireSuperAdmin, AdminUserController.suspendActivateUser);

// Delete a user — superadmins only
router.delete('/users/:id', adminAuthRequired, requireSuperAdmin, AdminUserController.deleteUser);

export default router;
