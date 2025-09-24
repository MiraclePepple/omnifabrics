import { Request, Response } from 'express';
import * as svc from './admin.service';

export const createAdmin = async (req:Request, res:Response) => {
  const { email, first_name, last_name, password, is_super } = req.body;
  const admin = await svc.createAdmin(email, first_name, last_name, password, !!is_super);
  res.status(201).json(admin);
};

export const assignPermission = async (req:Request, res:Response) => {
  const { adminId, permissionId } = req.body;
  const ap = await svc.assignPermission(adminId, permissionId);
  res.status(201).json(ap);
};
export const listAdmins = async (req:Request, res:Response) => {
  const admins = await svc.listAdmins();
  res.json(admins);
};

export const listPermissions = async (req:Request, res:Response) => {
  const permissions = await svc.listPermissions();
  res.json(permissions);
};