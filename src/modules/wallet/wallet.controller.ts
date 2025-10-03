// src/modules/wallet/wallet.controller.ts
import { Request, Response } from "express";
import walletService from "./wallet.service";

class WalletController {
  async getHistory(req: Request, res: Response) {
    try {
      const { storeId } = req.params;
      const { status } = req.query; // optional filter: success, failed, pending

      const history = await walletService.getWalletHistory(Number(storeId), status as string);

      return res.json({
        message: "Wallet transaction history retrieved",
        storeId,
        count: history.length,
        transactions: history,
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching wallet history", error: error.message });
    }
  }
}

export default new WalletController();
