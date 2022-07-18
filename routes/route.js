"use strict";
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../controllers/verifyToken");

module.exports = function (app) {
  var userHandlers = require("../controllers/userController.js");
  var productHandlers = require("../controllers/productController.js");
  var orderHandlers = require("../controllers/orderController.js");
  var cartHandlers = require("../controllers/cartController.js");
  var paymentHandlers = require("../controllers/paymentController.js");

  // users Routes
  app
    .route("/user/profile")
    .post(userHandlers.loginRequired, userHandlers.profile);
  app.route("/auth/register").post(userHandlers.register);
  app.route("/auth/signin").post(userHandlers.signin);
  app.route("/auth/update").put(userHandlers.update);

  // products Routes by category id
  app.route("/products/:cat_id/:page_no").get(productHandlers.products);

  // product by id Routes
  app.route("/product/:id").get(productHandlers.getProductById);

  // Categories Routes
  app.route("/categories").get(productHandlers.categories);

  // Create Orders Routes
  app.route("/order", verifyToken).post(orderHandlers.createOrder);

  // Update Orders Routes
  app.route("/order/:id", verifyTokenAndAdmin).put(orderHandlers.updateOrder);

  // Delete Orders Routes
  app
    .route("/order/:id", verifyTokenAndAdmin)
    .delete(orderHandlers.deleteOrder);

  // All Orders of a specific user route
  app
    .route("/order/find/:userId", verifyTokenAndAuthorization)
    .get(orderHandlers.getUserOrders);

  // A specific order of a specific user route
  app
    .route("/order/find/:userId/:orderId", verifyTokenAndAuthorization)
    .get(orderHandlers.getUserSingleOrder);

  // Get all Orders Routes
  app.route("/order", verifyTokenAndAdmin).get(orderHandlers.getUserOrders);

  // Get income Routes
  app.route("/income", verifyTokenAndAdmin).get(orderHandlers.getUserOrders);

  // Create add cart Routes
  app.route("/cart").post(cartHandlers.addItemToCart);

  // Get cart Routes
  app.route("/cart/:userId").get(cartHandlers.getCart);

  // Delete cart Routes
  app.route("/empty-cart").post(cartHandlers.emptyCart);

  // Create a payment
  app.route("/payment").post(paymentHandlers.createPayment);
};
