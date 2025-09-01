const express = require("express");
const {
  showAdminPanel,
  showProductPanel,
  createProduct,
  showProduct,
  editProduct,
  editPanel,
  deleteProduct,
} = require("../controllers/adminController");
const { upload } = require("../config/upload");
const adminRoutes = express.Router();

adminRoutes.get("/dashboard", showAdminPanel);
adminRoutes.get("/createproduct", showProductPanel);
adminRoutes.post("/create", upload.single("productImage"), createProduct);
adminRoutes.get("/showproduct", showProduct);
adminRoutes.get("/edit/:id", editPanel);
adminRoutes.post("/edit/:id", upload.single("productImage"), editProduct);
adminRoutes.post("/delete/:id", deleteProduct);

module.exports = {
  adminRoutes,
};
