import { Request, Response } from "express";
import { Card } from "../models/cardModel";
import { Order } from "../models/orderModel";
import { Cart } from "../models/cartModel";
import { CartItem } from "../models/cartItemModel";
import { ProductItem } from "../models/productItemModel";

// Simulate payment processing (replace with real gateway integration)
const processPayment = async (cardInfo: any, amount: number) => {
  return true; // assume success
};

export const payForCart = async (req: Request, res: Response) => {
  const { user_id, use_saved_card, saved_card_id, new_card, save_new_card, store_id } = req.body;

  try {
    // 1️⃣ Fetch user cart
    const cart = await Cart.findOne({ where: { user_id } });
    if (!cart) return res.status(400).json({ message: "Cart is empty" });

    const cartItems = await CartItem.findAll({ where: { cart_id: cart.cart_id } });
    if (cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

    // 2️⃣ Validate availability & calculate total
    const product_info: any[] = [];
    let total_amount = 0;

    for (const item of cartItems) {
      const productItem = await ProductItem.findByPk(item.product_item_id);
      if (!productItem || !productItem.is_available || productItem.quantity < item.quantity) {
        return res.status(400).json({ message: `Product ${productItem?.product_id} is out of stock` });
      }

      product_info.push({
        product_item_id: item.product_item_id,
        quantity: item.quantity,
        price: productItem.price,
      });

      total_amount += Number(productItem.price) * item.quantity;
    }

    // 3️⃣ Handle card selection
    let cardId: number | null = null;

    if (use_saved_card) {
      const card = await Card.findOne({ where: { card_id: saved_card_id, user_id } });
      if (!card) return res.status(400).json({ message: "Saved card not found" });
      cardId = card.card_id;
    } else if (new_card) {
      const { card_number, card_name, expiry_month, expiry_year, cvv } = new_card;

      if (save_new_card) {
        const savedCard = await Card.create({
          user_id,
          card_number,
          card_name,
          expiry_month,
          expiry_year,
          cvv,
        });
        cardId = savedCard.card_id;
      }
    } else {
      return res.status(400).json({ message: "Card information is required" });
    }

    // 4️⃣ Process payment
    const paymentSuccess = await processPayment(new_card || saved_card_id, total_amount);
    if (!paymentSuccess) return res.status(400).json({ message: "Payment failed" });

    // 5️⃣ Create order
    const order = await Order.create({
      user_id,
      store_id,
      total_amount,
      product_info: JSON.stringify(product_info),
      delivery_details: "pending", // you can replace with actual delivery info
      delivery_status: "pending",
      card_id: cardId,
      is_canceled: false,
    });

    // 6️⃣ Update stock for each product item
    for (const item of cartItems) {
      const productItem = await ProductItem.findByPk(item.product_item_id);
      if (productItem) {
        productItem.quantity -= item.quantity;
        if (productItem.quantity <= 0) {
          productItem.is_available = false;
        }
        await productItem.save();
      }
    }

    // 7️⃣ Clear cart items
    await CartItem.destroy({ where: { cart_id: cart.cart_id } });

    return res.json({ message: "Payment successful", order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
