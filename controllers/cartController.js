const { Cart } = require("../model/cartModel");
const { Product } = require("../model/productModel");

async function getCartPage(req, res) {
  const userId = req.user.id || req.user._id;
  try {
    const cart = await Cart.findOne({ userId }).populate("products.productId");

    const cartItems = cart
      ? cart.products.map((item) => ({
          _id: item.productId._id,
          productName: item.productId.productName,
          price: item.price,
          productImage: item.productId.productImage,
          quantity: item.quantity,
        }))
      : [];

    const subtotal =
      cartItems.length > 0
        ? cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
        : 0;
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    res.render("Cart", {
      findProduct: cartItems,
      subtotal,
      totalItems,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
    });
  } catch (error) {
    console.error("Error in getCartPage:", error.message);
    res.status(500).send("Server Error");
    res.render("Dashboard", {
      error_msg: "Server Error",
      success_msg: null,
    });
  }
}

async function addProductToCart(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product)
      return res.render("Dashboard", {
        error_msg: "Product not found",
        success_msg: null,
      });

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        products: [],
        totalPrice: 0,
      });
    }

    const existingItem = cart.products.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.price = existingItem.quantity * product.price;
    } else {
      cart.products.push({
        productId,
        quantity: 1,
        price: product.price,
      });
    }

    cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price, 0);

    await cart.save();
    req.flash("success_msg", "Product added to cart");
    res.redirect("/auth/cart");
  } catch (error) {
    console.error("Error in addProductToCart:", error.message);
    res.status(500).send("Server Error");
  }
}

async function removefromCart(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const productId = req.params.productId;
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.redirect("/auth/cart");

    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );
    cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price, 0);

    await cart.save();
    req.flash("success_msg", "Product Removed from Cart");
    res.redirect("/auth/cart");
  } catch (error) {
    console.error("Error in removeProductFromCart:", error.message);
    res.render("Cart", {
      success_msg: null,
      error_msg: "Server Error",
    });
  }
}

async function updateProductQuantity(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const productId = req.params.productId;
    const { action, quantity } = req.body;

    const cart = await Cart.findOne({ userId }).populate("products.productId");

    if (cart) {
      const item = cart.products.find(
        (item) => item.productId._id.toString() === productId
      );

      if (item) {
        if (action === "increase") {
          item.quantity += 1;
        } else if (action === "decrease" && item.quantity > 1) {
          item.quantity -= 1;
        } else if (quantity) {
          item.quantity = parseInt(quantity, 10);
        }

        // update price for this product
        item.price = item.quantity * item.productId.price;
      }

      // update total price
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price,
        0
      );

      await cart.save();
    }

    res.redirect("/auth/cart");
  } catch (error) {
    console.error("Error in updateProductQuantity:", error.message);
    res.render("Cart", {
      error_msg: "Server Error",
      success_msg: null,
    });
  }
}

module.exports = {
  addProductToCart,
  getCartPage,
  removefromCart,
  updateProductQuantity,
};
