import { Wallet, Transaction } from './wallet.model';

export const getWalletForStore = async (storeId:number) => Wallet.findOne({ where: { store_id: storeId }});

export const createTransaction = async (walletId:number, amount:number, type:string, description?:string) => {
  const tx = await Transaction.create({ wallet_id: walletId, amount, type, status: 'pending', description, created_at: new Date() });
  return tx;
};

export const updateWalletBalance = async (walletId:number, amount:number, isCredit:boolean) => {
  const wallet = await Wallet.findByPk(walletId);
  if (!wallet) throw new Error('Wallet not found');
  const current = Number(wallet.get('balance') || 0);
  const newBal = isCredit ? current + amount : current - amount;
  wallet.set('balance', newBal);
  await wallet.save();
  return wallet;
};
