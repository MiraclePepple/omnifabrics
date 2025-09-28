// src/modules/payment/payment.service.ts
import { User } from '../users/user.model';
import { Product } from '../products/product.model';
import { Cart, CartItem } from '../cart/cart.model';
//import Flutterwave from 'flutterwave-node-v3';
import { Card } from '../card/card.model';

const Flutterwave: any = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY!, process.env.FLW_SECRET_KEY!);

interface CardInfo {
  useSaved: boolean;
  savedCardId?: string; // id of saved card in DB
  cardNumber?: string;
  expiry?: string; // MM/YY
  cvv?: string;
  saveNew?: boolean;
}

interface DeliveryInfo {
  address: string;
  phone: string;
}

interface PayPayload {
  userId: number;
  productId?: number;
  fromCart?: boolean;
  card: CardInfo;
  delivery: DeliveryInfo;
}

export const payForProduct = async (data: PayPayload) => {
  // 1. Fetch user
  const user = await User.findByPk(data.userId);
  if (!user) throw new Error('User not found');

  // 2. Get products
  let products: any[] = [];
  if (data.fromCart) {
    const cartItems = await CartItem.findAll({
      where: { cart_id: (await Cart.findOne({ where: { user_id: data.userId } }))?.get('cart_id') as any },
    });

    if (!cartItems.length) throw new Error('Cart is empty');

    for (const item of cartItems) {
      const p = await Product.findByPk(item.get('product_id') as any);
      if (p) products.push(p);
    }
  } else if (data.productId) {
    const p = await Product.findByPk(data.productId);
    if (!p) throw new Error('Product not found');
    products = [p];
  } else {
    throw new Error('No product or cart selected');
  }

  // 3. Total amount
  const totalAmount = products.reduce((sum, p) => sum + Number(p.get('price') ?? 0), 0);

  // 4. Delivery info – update user delivery if needed
  if (data.delivery.address || data.delivery.phone) {
    user.address = data.delivery.address || user.address;
    user.phone_number = data.delivery.phone || user.phone_number;
    await user.save();
  }

  // 5. Card details (this is simplified – in reality you'd tokenize cards)
  let cardPayload: any;
  if (data.card.useSaved) {
  const savedCard = await Card.findOne({
    where: { card_id: data.card.savedCardId, user_id: data.userId },
  });
  if (!savedCard) throw new Error('Saved card not found');

  const txRef = 'txn_' + Date.now();
  // charge using tokenized card:
  const chargeResponse = await flw.Tokenized.charge({
    token: savedCard.card_token,
    currency: 'NGN',
    amount: totalAmount,
    email: user.email,
    tx_ref: txRef,
  });

  if (chargeResponse.status !== 'success') {
    throw new Error('Payment failed: ' + chargeResponse.message);
  }

  return {
    message: 'Payment successful (saved card)',
    transaction: {
      tx_ref: txRef,
      flutterwave_id: chargeResponse.data.id,
      status: chargeResponse.data.status,
      charged_amount: chargeResponse.data.amount,
    },
    products: products.map((p) => ({
      id: p.get('product_id'),
      name: p.get('product_name'),
    })),
    delivery: {
      address: user.address,
      phone: user.phone_number,
    },
  };
}
else {
    if (!data.card.expiry) {
      throw new Error('Card expiry is not provided');
    }
    cardPayload = {
      card_number: data.card.cardNumber,
      cvv: data.card.cvv,
      expiry_month: data.card.expiry.split('/')[0],
      expiry_year: data.card.expiry.split('/')[1],
    };
  }

  // 6. Charge with Flutterwave
  const txRef = 'txn_' + Date.now();

  const chargeResponse = await flw.Charge.card({
    card_number: cardPayload.card_number,
    cvv: cardPayload.cvv,
    expiry_month: cardPayload.expiry_month,
    expiry_year: cardPayload.expiry_year,
    currency: 'NGN',
    amount: totalAmount,
    email: user.email,
    tx_ref: txRef,
  });

  if (chargeResponse.status !== 'success') {
    throw new Error('Payment failed: ' + chargeResponse.message);
  }

  // optionally save card details here
  if (data.card.saveNew && chargeResponse.data.card?.token) {
    if (!data.card.expiry) {
      throw new Error('Card expiry is not provided');
    }
  await Card.create({
    user_id: data.userId,
    card_token: chargeResponse.data.card.token, // Flutterwave token
    last4: chargeResponse.data.card.last_4digits,
    card_type: chargeResponse.data.card.type,
    expiry_month: data.card.expiry.split('/')[0],
    expiry_year: data.card.expiry.split('/')[1],
  });
}

  return {
    message: 'Payment successful',
    transaction: {
      tx_ref: txRef,
      flutterwave_id: chargeResponse.data.id,
      status: chargeResponse.data.status,
      charged_amount: chargeResponse.data.amount,
    },
    products: products.map((p) => ({
      id: p.get('product_id'),
      name: p.get('product_name'),
    })),
    delivery: {
      address: user.address,
      phone: user.phone_number,
    },
  };
};
