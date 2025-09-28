// src/types/flutterwave-node-v3/index.d.ts

declare module "flutterwave-node-v3" {
  /** Initialization options (public & secret) */
  class Flutterwave {
    constructor(publicKey: string, secretKey: string);

    // Modules / Services
    Charge: typeof Charge;
    Tokenized: typeof Tokenized;
    Transaction: typeof Transaction;
    Transfer: typeof Transfer;
    Misc: typeof Misc;
    Beneficiary: typeof Beneficiary;
    PaymentPlan: typeof PaymentPlan;
    Subscription: typeof Subscription;
  }

  // ========== Common response types ==========

  interface FWResponse<T = any> {
    status: string;     // e.g. "success" or "error"
    message: string;
    data: T | null;
  }

  interface CustomerInfo {
    id?: number;
    name?: string;
    email?: string;
    phone_number?: string;
    created_at?: string;
    [key: string]: any;
  }

  interface CardInfo {
    first_6digits?: string;
    last_4digits?: string;
    issuer?: string;
    country?: string;
    type?: string;
    token?: string;
    expiry?: string;
    [key: string]: any;
  }

  interface ChargeData {
    id: number;
    tx_ref: string;
    flw_ref?: string;
    amount: number;
    currency: string;
    charged_amount?: number;
    status: string;        // e.g. "successful", "pending"
    payment_type?: string;
    card?: CardInfo;
    customer?: CustomerInfo;
    [key: string]: any;
  }

  interface TransferData {
    id: number;
    account_number: string;
    bank_code?: string;
    full_name?: string;
    created_at?: string;
    currency: string;
    debit_currency?: string;
    amount: number;
    fee?: number;
    status: string;
    reference: string;
    narration?: string;
    complete_message?: string;
    is_approved?: number;
    requires_approval?: number;
    [key: string]: any;
  }

  // ========== Charge module ==========

  class Charge {
    /**
     * Charge a card with full card details.
     */
    static card(payload: {
      card_number: string;
      cvv: string;
      expiry_month: string | number;
      expiry_year: string | number;
      currency: string;
      amount: number;
      email: string;
      tx_ref: string;
      redirect_url?: string;
      authorization?: { mode: string; [k: string]: any };
      [key: string]: any;
    }): Promise<FWResponse<ChargeData>>;

    /**
     * Use this to validate a charge (e.g. with OTP / flw_ref)
     */
    static validate(payload: {
      otp: string;
      flw_ref: string;
    }): Promise<FWResponse<ChargeData>>;
  }

  // ========== Tokenized (card-on-file) module ==========

  class Tokenized {
    /**
     * Charge a tokenized card (card-on-file)
     */
    static charge(payload: {
      token: string;
      currency: string;
      amount: number;
      email: string;
      tx_ref: string;
      [key: string]: any;
    }): Promise<FWResponse<ChargeData>>;
  }

  // ========== Transaction (verification) module ==========

  class Transaction {
    /**
     * Verify a transaction by ID
     */
    static verify(payload: { id: number | string }): Promise<FWResponse<ChargeData>>;
  }

  // ========== Transfer / Payout module ==========

  class Transfer {
    /**
     * Initiate a new transfer / payout
     */
    static initiate(payload: {
      account_bank?: string;
      account_number?: string;
      amount: number;
      currency: string;
      reference: string;
      narration?: string;
      beneficiary?: number;
      debit_currency?: string;
      callback_url?: string;
      [key: string]: any;
    }): Promise<FWResponse<TransferData>>;

    /**
     * Get details of a transfer by id
     */
    static get_a_transfer(payload: { id: number | string }): Promise<FWResponse<TransferData>>;

    /**
     * Retry a failed transfer
     */
    static retry(payload: { id: number | string }): Promise<FWResponse<TransferData>>;

    /**
     * Get the fee for a prospective transfer
     */
    static fee(payload: {
      amount: number;
      currency: string;
      type: string; // e.g. "account", "mobilemoney"
    }): Promise<FWResponse<{ fee: number }>>;
  }

  // ========== Beneficiary (for transfers) ==========

  class Beneficiary {
    static create(payload: { [key: string]: any }): Promise<FWResponse<any>>;
    static get(payload: { id: number | string }): Promise<FWResponse<any>>;
    static list(): Promise<FWResponse<any[]>>;
    static delete(payload: { id: number | string }): Promise<FWResponse<any>>;
  }

  // ========== Misc / Utility module ==========

  class Misc {
    static resolveAccount(payload: { account_number: string; account_bank: string; [k: string]: any }): Promise<FWResponse<any>>;
    static resolveBVN(payload: { bvn: string }): Promise<FWResponse<any>>;
    static resolveCardBins(payload: { bin: string }): Promise<FWResponse<any>>;
    // add more misc endpoints as needed
  }

  // ========== Payment Plans & Subscriptions (for recurring) ==========

  class PaymentPlan {
    static create(payload: { [key: string]: any }): Promise<FWResponse<any>>;
    static list(): Promise<FWResponse<any[]>>;
    static fetch(payload: { id: number | string }): Promise<FWResponse<any>>;
    static update(payload: { id: number | string; [key: string]: any }): Promise<FWResponse<any>>;
  }

  class Subscription {
    static activate(payload: { id: number | string; [key: string]: any }): Promise<FWResponse<any>>;
    static fetch(payload: { id: number | string }): Promise<FWResponse<any>>;
    static list(): Promise<FWResponse<any[]>>;
    static cancel(payload: { id: number | string }): Promise<FWResponse<any>>;
    static deactivate(payload: { id: number | string }): Promise<FWResponse<any>>;
  }

  export default Flutterwave;
}
