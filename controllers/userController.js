"use strict";

var mongoose = require("mongoose"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcrypt"),
  User = mongoose.model("User");

exports.register = function (req, res) {
  let reqBody = req.body;
  console.log({ reqBody });
  var newUser = new User(req.body);
  newUser.password = bcrypt.hashSync(req.body.password, 10);
  newUser.save(function (err, user) {
    if (err) {
      console.log(err);
      return res.status(400).send({
        message: err,
      });
    } else {
      user.password = undefined;
      return res.json({
        token: jwt.sign(
          {
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            birth: user.birth,
            _id: user._id,
          },
          "RESTFULAPIs"
        ),
      });
    }
  });
};

exports.update = async function (req, res) {
  let reqBody = req.body;
  const updatedUser = await User.findOneAndUpdate(
    { _id: req.body._id },
    {
      $set: {
        email: req.body.email,
        fullName: req.body.fullName,
        phone: req.body.phone,
        birth: req.body.birth,
      },
    },
    { new: true }
  );
  const payload = {
    email: updatedUser.email,
    fullName: updatedUser.fullName,
    phone: updatedUser.phone,
    birth: updatedUser.birth,
    _id: updatedUser._id,
  };
  const token = jwt.sign(JSON.stringify(payload), "RESTFULAPIs");
  res.json({
    token,
  });
};

exports.signin = function (req, res) {
  User.findOne(
    {
      email: req.body.email,
    },
    function (err, user) {
      if (err) throw err;
      if (!user || !user.comparePassword(req.body.password)) {
        return res.status(401).json({
          message: "Authentication failed. Invalid user or password.",
        });
      }
      return res.json({
        token: jwt.sign(
          {
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            birth: user.birth,
            _id: user._id,
          },
          "RESTFULAPIs"
        ),
      });
    }
  );
};

exports.loginRequired = function (req, res, next) {
  if (req.user) {
    next();
  } else {
    return res.status(401).json({ message: "Unauthorized user!!" });
  }
};
exports.profile = function (req, res, next) {
  if (req.user) {
    res.send(req.user);
    next();
  } else {
    return res.status(401).json({ message: "Invalid token" });
  }
};
