const { Order } = require("../model/orderModel");
const { Cart } = require("../model/cartModel"); // cart model agar use kar raha hai

// Checkout page render
const getCheckoutPage = async (req, res) => {
  try {
    // Yahan assume kar rahe hain ki cart me products stored hain
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "products.productId"
    );
    res.render("Checkout", {
      products: cart ? cart.products : [],
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
    });
  } catch (err) {
    console.error("Error loading checkout:", err);
    res.status(500).send("Server Error");
  }
};

// Place order
const placeOrder = async (req, res) => {
  try {
    const { address } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "products.productId"
    );
    if (!cart || cart.products.length === 0) {
      return res.redirect("/auth/cart");
    }

    let totalAmount = 0;
    const products = cart.products.map((item) => {
      totalAmount += item.productId.price * item.quantity;
      return {
        product: item.productId.id,
        quantity: item.quantity,
      };
    });

    // Order create
    const newOrder = new Order({
      user: req.user.id,
      products,
      totalAmount,
      address,
    });
    await newOrder.save();

    // Empty cart after order placed
    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();

    res.render("orderSuccess", {
      order: newOrder,
      success_msg: "Order Placed Successfully",
      error_msg: req.flash("error_msg"),
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.render("Checkout", {
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
    });
  }
};

const getOrdersPage = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("products.product")
      .sort({ createdAt: -1 }); // latest order first

    res.render("Order", { orders });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  getCheckoutPage,
  placeOrder,
  getOrdersPage,
};
