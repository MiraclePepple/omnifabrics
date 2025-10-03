// src/modules/wallet/wallet.service.ts
import Wallet from "./wallet.model";
import Transaction from "../payment/transaction.model";
import { Order } from "../orders/order.model";
import Store from "../store/store.model";

class WalletService {
  async creditWallet(storeId: number, amount: number) {
    const wallet = await Wallet.findOne({ where: { store_id: storeId } });
    if (!wallet) throw new Error("Wallet not found");

    wallet.balance = Number(wallet.balance) + Number(amount);
    await wallet.save();

    return wallet;
  }

  async debitWallet(storeId: number, amount: number) {
    const wallet = await Wallet.findOne({ where: { store_id: storeId } });
    if (!wallet) throw new Error("Wallet not found");

    if (Number(wallet.balance) < Number(amount)) {
      throw new Error("Insufficient wallet balance");
    }

    wallet.balance = Number(wallet.balance) - Number(amount);
    await wallet.save();

    return wallet;
  }

  async getWalletHistory(storeId: number, status?: string) {
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const transactions = await Transaction.findAll({
      include: [
        {
          model: Order,
          as: "order",
          required: true,
          where: { store_id: storeId },
          include: [
            { model: Store, as: "store" }
          ]
        }
      ],
      where: whereClause,
      order: [["created_at", "DESC"]],
    });

    return transactions;
  }
}

export default new WalletService();
