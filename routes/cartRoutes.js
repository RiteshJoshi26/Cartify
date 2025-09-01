const express = require("express");
const {
  getCartPage,
  addProductToCart,
  removefromCart,
  updateProductQuantity,
} = require("../controllers/cartController");
const cartRoutes = express.Router();

cartRoutes.get("/cart", getCartPage);
cartRoutes.post("/add/:productId", addProductToCart);
cartRoutes.post("/remove/:productId", removefromCart);
cartRoutes.post("/update/:productId", updateProductQuantity);

module.exports = {
  cartRoutes,
};
