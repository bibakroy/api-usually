const Payment = require("../models/paymentModels");
const Order = require("../models/orderModels");
const stripe = require("stripe")(process.env.STRIPE_KEY);

exports.createPayment = async (req, res) => {
  try {
    const token = await stripe.tokens.create({
      card: {
        number: req.body.number,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year,
        cvc: req.body.cvc,
        name: req.body.name,
      },
    });
    const response = await stripe.charges.create({
      source: token.id,
      amount: (req.body.amount * 100).toFixed(0),
      currency: "usd",
    });
    const paymentData = {
      userId: req.body.userId,
      amount: req.body.amount,
    };
    const newPayment = new Payment(paymentData);
    try {
      const savedPayment = await newPayment.save();

      const newOrder = new Order(req.body);
      try {
        const savedOrder = await newOrder.save();
        res.status(200).json(savedOrder);
      } catch (orderError) {
        res.status(500).json(`Order not placed ${orderError}`);
      }
    } catch (paymentError) {
      await stripe.refunds.create({
        charge: response.id,
      });

      await Order.findByIdAndDelete(savedPayment._id);

      res
        .status(500)
        .json(`Payment not saved to DB, so refunded ${paymentError}`);
    }
  } catch (error) {
    res.status(500).json(`Stripe error: ${error}`);
  }
};
