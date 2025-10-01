import { Router } from 'express';
import { AdminController } from './admin.controller';
import { adminAuthRequired, requireSuperAdmin } from '../../middlewares/validate.middleware';

const router = Router();

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

router.post('/:id/permissions/assign', adminAuthRequired, requireSuperAdmin, AdminController.assignPermissions);
router.put('/:id/permissions/replace', adminAuthRequired, requireSuperAdmin, AdminController.replacePermissions);
router.delete('/:id/permissions/remove', adminAuthRequired, requireSuperAdmin, AdminController.removePermissions);
router.get('/:id/permissions', adminAuthRequired, requireSuperAdmin, AdminController.getPermissions);

router.patch('/:id/super', adminAuthRequired, requireSuperAdmin, AdminController.setSuperAdmin);

export default router;
