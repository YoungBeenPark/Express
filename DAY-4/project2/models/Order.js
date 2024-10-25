const mongoose = require("mongoose");

// 주문 스키마
const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true, min: 1 },
      name: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
  shippingInfo: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  orderStatus: {
    type: String,
    enum: ["접수", "배송 중", "배송 완료"],
    default: "접수",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Order", OrderSchema);
