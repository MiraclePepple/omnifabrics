// src/modules/wallet/wallet.routes.ts
import { Router } from "express";
import walletController from "./wallet.controller";

const router = Router();

// GET /api/v1/wallet/:storeId/history?status=success
router.get("/:storeId/history", walletController.getHistory);

export default router;
