const express = require("express");
const orderRoutes = express.Router();
const {
  getCheckoutPage,
  placeOrder,
  getOrdersPage,
} = require("../controllers/orderController");

// Checkout page
orderRoutes.get("/checkout", getCheckoutPage);

// Place order
orderRoutes.post("/place", placeOrder);

orderRoutes.get("/orders", getOrdersPage);

module.exports = {
  orderRoutes,
};
