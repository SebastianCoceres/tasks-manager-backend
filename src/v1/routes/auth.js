const router = require("express").Router();
const userController = require("../controllers/user");
const { body } = require("express-validator");
const validation = require("../handlers/validation");
const tokenHandler = require("../handlers/tokenHandler");
const User = require("../models/user");

router.post(
  "/signup",
  body("username")
    .isLength({ min: 8 })
    .withMessage("El nombre de usuario debe contener al menos 8 carácteres"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe contener al menos 8 carácteres"),
  body("confirmPassword")
    .isLength({ min: 8 })
    .withMessage("La confirmación debe contener al menos 8 carácteres"),
  body("password")
    .matches(/^(?=.*\d)(?=.*[A-Z])(?=.*\W)[\dA-Za-z\W]{8,}$/)
    .withMessage(
      "La contraseña debe contener al menos un número, una letra mayúscula y un caracter no alfanumérico"
    ),
  body("username").custom((value) => {
    return User.findOne({ username: value }).then((user) => {
      if (user) {
        return Promise.reject("Nombre de usuario ya usado");
      }
    });
  }),
  body("verificationCode").custom((value) => {
    if (value !== process.env.VERIFICATION_SECRET_KEY) {
      return Promise.reject("CVU incorrecto");
    }
  }),
  validation.validate,
  userController.register
);

router.post(
  "/login",
  body("username")
    .isLength({ min: 8 })
    .withMessage("El nombre de usuario debe contener al menos 8 carácteres"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe contener al menos 8 carácteres"),
  validation.validate,
  userController.login
);

router.post("/verify-token", tokenHandler.verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
