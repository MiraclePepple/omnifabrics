import { Admin } from './admin.model';
import { Permission } from '../permissions/permission.model';
import { AdminPermission } from '../admin_permission/admin_permission.model';
import bcrypt from 'bcryptjs';

export const createAdmin = async (email:string, firstName:string, lastName:string, rawPassword:string, isSuper=false) => {
  const hashed = await bcrypt.hash(rawPassword, 10);
  return Admin.create({ email, first_name: firstName, last_name: lastName, new_password: hashed, is_superadmin: isSuper, created_at: new Date() });
};

export const assignPermission = async (adminId:number, permissionId:number) => AdminPermission.create({ 
    admin_id: adminId, permission_id: permissionId, granted: true, created_at: new Date() });
export const listAdmins = async () => Admin.findAll({ attributes: { exclude: ['new_password'] }});
export const listPermissions = async () => Permission.findAll();