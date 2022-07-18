const cartRepository = require("../action/cartAction");
const productRepository = require("../action/productAction");
const Cart = require("../models/cartModels");

exports.addItemToCart = async (req, res) => {
  const { productId, userId } = req.body;

  const quantity = Number.parseInt(req.body.quantity);
  try {
    let productDetails = await productRepository.getProductById(productId);

    if (!productDetails) {
      return res.status(500).json({
        type: "Not Found",
        msg: "Invalid request",
      });
    }

    const cartResult = await Cart.find({
      userId: userId,
    });
    if (cartResult.length > 0) {
      //---- check if new product already exists in cart or not. -1 means not exist----
      const indexFound = cartResult[0].items.findIndex(
        (item) => item.productId == productId
      );

      function getSubTotal() {
        const totalArray = cartResult[0].items.map((item) => {
          if (item.productId == productId) {
            return;
          } else {
            return item.total;
          }
        });
        const sumOfTotal = totalArray
          .reduce((acc, cur) => acc + Number(cur), 0)
          .toFixed(2);
        return sumOfTotal;
      }

      Cart.findOne({ userId: userId })
        .then((doc) => {
          items = doc.items;

          if (indexFound !== -1 && quantity > 0) {
            const totalArray = cartResult[0].items.map((item) => {
              if (item.productId == productId) {
                return (productDetails.sale_price * quantity).toFixed(2);
              } else {
                return item.total;
              }
            });
            const sumOfTotal = totalArray
              .reduce((acc, cur) => acc + Number(cur), 0)
              .toFixed(2);
            product = doc.items[indexFound];
            product.quantity = quantity;
            product.total = (productDetails.sale_price * quantity).toFixed(2);
            doc.subTotal = sumOfTotal;
            return doc;
          } else if (indexFound === -1 && quantity > 0) {
            const totalArray = cartResult[0].items.map((item) => item.total);
            totalArray.push((productDetails.sale_price * quantity).toFixed(2));
            const sumOfTotal = totalArray
              .reduce((acc, cur) => acc + Number(cur), 0)
              .toFixed(2);
            items.push({
              productId: productId,
              quantity: quantity,
              total: (productDetails.sale_price * quantity).toFixed(2),
              price: productDetails.sale_price,
            });
            doc.subTotal = sumOfTotal;
            return doc;
          } else if (quantity === 0 && indexFound !== -1) {
            let totalArray = [];
            cartResult[0].items.map((item) => {
              if (item.productId !== productId) {
                totalArray.push(item.total);
              }
            });
            const sumOfTotal = totalArray
              .reduce((acc, cur) => acc + Number(cur), 0)
              .toFixed(2);
            items.splice(indexFound, 1);
            doc.subTotal = sumOfTotal;
            return doc;
          } else {
            res.status(400).json({
              type: "Invalid",
              msg: "Invalid request",
            });
          }
        })
        .then((doc) => {
          doc.save().then((data) => {
            res.status(200).json({
              type: "success",
              mgs: "Added to cart successfully",
              data: data,
            });
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(400).json({
            type: "Invalid",
            msg: "Invalid request",
          });
        });
    } else {
      const cartData = {
        userId: userId,
        items: [
          {
            productId: productId,
            quantity: quantity,
            total: (productDetails.sale_price * quantity).toFixed(2),
            price: productDetails.sale_price,
          },
        ],
        subTotal: (productDetails.sale_price * quantity).toFixed(2),
      };
      const newCart = new Cart(cartData);
      let data = await newCart.save();
      res.status(200).json(data);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      type: "Invalid",
      msg: "Something Went Wrong",
      err: err,
    });
  }
};

exports.getCart = async (req, res) => {
  const userId = req.params.userId;
  console.log({ userId });
  try {
    const cartData = await Cart.find({ userId: userId });
    res.status(200).json({
      status: true,
      data: cartData,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      type: "Invalid",
      msg: "Something Went Wrong",
      err: err,
    });
  }
};

exports.emptyCart = async (req, res) => {
  try {
    let cart = await cartRepository.cart();
    cart.items = [];
    cart.subTotal = 0;
    let data = await cart.save();
    res.status(200).json({
      type: "success",
      mgs: "Cart Has been emptied",
      data: data,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      type: "Invalid",
      msg: "Something Went Wrong",
      err: err,
    });
  }
};
