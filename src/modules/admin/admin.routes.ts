import { Router } from 'express';
import { AdminController } from './admin.controller';
import { adminAuthRequired, requireSuperAdmin, requireAdmin, requirePermission } from '../../middlewares/validate.middleware';
import { AdminUsersController } from './admin.users.controller';
import { AdminProductsController } from './admin.products.controller';

const router = Router();

// Admin account management (super-admin protected where appropriate)
router.post('/create', adminAuthRequired, requireSuperAdmin, AdminController.createAdminBySuper);
router.post('/login', AdminController.login);
router.post('/first-time-setup', adminAuthRequired, AdminController.firstTimeSetup);
router.post('/forgot-password', AdminController.forgotPassword);
router.post('/verify-otp', AdminController.verifyOTP);
router.post('/reset-password', AdminController.resetPassword);
router.get('/profile', adminAuthRequired, AdminController.getProfile);
router.put('/profile', adminAuthRequired, AdminController.updateProfile);
router.post('/change-password', adminAuthRequired, AdminController.changePassword);

router.patch('/:id/block', adminAuthRequired, requireSuperAdmin, AdminController.blockAdmin);
router.patch('/:id/unblock', adminAuthRequired, requireSuperAdmin, AdminController.unblockAdmin);
router.get('/list', adminAuthRequired, requireSuperAdmin, AdminController.listAdmins);
router.delete('/:id', adminAuthRequired, requireSuperAdmin, AdminController.deleteAdmin);

// -------------------------------------------------
// User management (SRS)
// - list, get, suspend, activate, delete by admins with appropriate permissions
// -------------------------------------------------
router.get('/users', adminAuthRequired, requireAdmin, AdminUsersController.listUsers); // query param ?type=buyers|sellers|suspended
router.get('/users/:id', adminAuthRequired, requireAdmin, AdminUsersController.getUser);
router.patch('/users/:id/block', adminAuthRequired, requireAdmin, requirePermission('suspend_user_account'), AdminUsersController.blockUser);
router.patch('/users/:id/unblock', adminAuthRequired, requireAdmin, requirePermission('suspend_user_account'), AdminUsersController.unblockUser);
router.patch('/users/:id/suspend', adminAuthRequired, requireAdmin, requirePermission('suspend_user_account'), AdminUsersController.suspendUser);
router.patch('/users/:id/activate', adminAuthRequired, requireAdmin, requirePermission('suspend_user_account'), AdminUsersController.activateUser);
router.delete('/users/:id', adminAuthRequired, requireAdmin, requirePermission('delete_user_account'), AdminUsersController.deleteUser);

// -------------------------------------------------
// Product / Store management (admin actions)
// -------------------------------------------------
router.patch('/products/:id/disable', adminAuthRequired, requireAdmin, requirePermission('disable_product'), AdminProductsController.disableProduct);
router.patch('/products/:id/enable', adminAuthRequired, requireAdmin, requirePermission('disable_product'), AdminProductsController.enableProduct);

router.patch('/stores/:id/disable', adminAuthRequired, requireAdmin, requirePermission('disable_store'), AdminProductsController.disableStore);
router.patch('/stores/:id/enable', adminAuthRequired, requireAdmin, requirePermission('disable_store'), AdminProductsController.enableStore);

// -------------------------------------------------
// Admin permission endpoints (existing)
router.post('/:id/permissions/assign', adminAuthRequired, requireSuperAdmin, AdminController.assignPermissions);
router.put('/:id/permissions/replace', adminAuthRequired, requireSuperAdmin, AdminController.replacePermissions);
router.delete('/:id/permissions/remove', adminAuthRequired, requireSuperAdmin, AdminController.removePermissions);
router.get('/:id/permissions', adminAuthRequired, requireSuperAdmin, AdminController.getPermissions);
router.patch('/:id/super', adminAuthRequired, requireSuperAdmin, AdminController.setSuperAdmin);

export default router;
