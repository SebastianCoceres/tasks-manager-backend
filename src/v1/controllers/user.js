const User = require("../models/user");
const CryptoJS = require("crypto-js");
const JWT = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { password, verificationCode } = req.body;
  try {
    req.body.password = CryptoJS.AES.encrypt(
      password,
      process.env.PASSWORD_SECRET_KEY
    );
    if (verificationCode === process.env.VERIFICATION_SECRET_KEY) {
      const user = await User.create(req.body);
      const token = JWT.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY, {
        expiresIn: "24h",
      });
      res.status(201).json({ user: user.username, token });
    } else {
      throw new Error({ error: "You Shall Not Pass 🧙‍♂️" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username }).select("password username");
    if (!user) {
      return res.status(401).json({
        errors: [
          {
            param: "username",
            msg: "Usuario o contraseña incorrectos",
          },
        ],
      });
    }

    const decryptedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASSWORD_SECRET_KEY
    ).toString(CryptoJS.enc.Utf8);

    if (decryptedPassword !== password) {
      return res.status(401).json({
        errors: [
          {
            param: "username",
            msg: "Usuario o contraseña incorrectos",
          },
        ],
      });
    }

    user.password = undefined;
    user.id = undefined;
    const token = JWT.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY, {
      expiresIn: "24h",
    });

    res.status(200).json({ user: user.username, token });
  } catch (err) {
    res.status(500).json(err);
  }
};
