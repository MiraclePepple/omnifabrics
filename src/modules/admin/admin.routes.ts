import { Router } from "express";
import { AdminController } from "./admin.controller";
import { AdminUsersController } from "./admin.users.controller";
import AdminProductController from "./admin.products.controller";
import {
  adminAuthRequired,
  requireSuperAdmin,
  requireAdmin,
  requirePermission,
} from "../../middlewares/validate.middleware";

const router = Router();

// --------------------
// Admin account management
// --------------------
router.post("/create", adminAuthRequired, requireSuperAdmin, AdminController.createAdminBySuper);
router.post("/login", AdminController.login);
router.post("/first-time-setup", adminAuthRequired, AdminController.firstTimeSetup);
router.post("/forgot-password", AdminController.forgotPassword);
router.post("/verify-otp", AdminController.verifyOTP);
router.post("/reset-password", AdminController.resetPassword);
router.get("/profile", adminAuthRequired, AdminController.getProfile);
router.put("/profile", adminAuthRequired, AdminController.updateProfile);
router.post("/change-password", adminAuthRequired, AdminController.changePassword);

router.patch("/:id/block", adminAuthRequired, requireSuperAdmin, AdminController.blockAdmin);
router.patch("/:id/unblock", adminAuthRequired, requireSuperAdmin, AdminController.unblockAdmin);
router.get("/list", adminAuthRequired, requireSuperAdmin, AdminController.listAdmins);
router.delete("/:id", adminAuthRequired, requireSuperAdmin, AdminController.deleteAdmin);

// --------------------
// User management (SRS)
// --------------------
router.get("/users", adminAuthRequired, requireAdmin, AdminUsersController.listUsers);
router.get("/users/:id", adminAuthRequired, requireAdmin, AdminUsersController.getUser);
router.patch("/users/:id/block", adminAuthRequired, requireAdmin, requirePermission("suspend_user_account"), AdminUsersController.blockUser);
router.patch("/users/:id/unblock", adminAuthRequired, requireAdmin, requirePermission("suspend_user_account"), AdminUsersController.unblockUser);
router.delete("/users/:id", adminAuthRequired, requireAdmin, requirePermission("delete_user_account"), AdminUsersController.deleteUser);


// --------------------
// Admins & Super Admins → list
router.get("/products", adminAuthRequired, requireAdmin, AdminProductController.listAllProducts);

// Super Admin only → create, update, delete
router.post("/products", adminAuthRequired, requireSuperAdmin, AdminProductController.createProduct);
router.put("/products/:id", adminAuthRequired, requireSuperAdmin, AdminProductController.updateProduct);
router.delete("/products/:id", adminAuthRequired, requireSuperAdmin, AdminProductController.deleteProduct);

// --------------------
// Admin permission management
// --------------------
router.post("/:id/permissions/assign", adminAuthRequired, requireSuperAdmin, AdminController.assignPermissions);
router.put("/:id/permissions/replace", adminAuthRequired, requireSuperAdmin, AdminController.replacePermissions);
router.delete("/:id/permissions/remove", adminAuthRequired, requireSuperAdmin, AdminController.removePermissions);
router.get("/:id/permissions", adminAuthRequired, requireSuperAdmin, AdminController.getPermissions);
router.patch("/:id/super", adminAuthRequired, requireSuperAdmin, AdminController.setSuperAdmin);

export default router;
