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
  body("username").custom(async (value) => {
    return await User.findOne({ username: value }).then((user) => {
      if (user) {
        return Promise.reject("Nombre de usuario ya usado");
      } else {
        return Promise.resolve();
      }
    });
  }),
  body("verificationCode").custom((value) => {
    if (value !== process.env.VERIFICATION_SECRET_KEY) {
      return Promise.reject("CVU incorrecto");
    } else {
      return Promise.resolve();
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

router.put(
  "/edit-username",
  body("userId").custom((value) => {
    if (!validation.isObjectId(value)) {
      return Promise.reject("invalid id");
    } else return Promise.resolve();
  }),
  body("username")
    .isLength({ min: 8 })
    .withMessage("El nombre de usuario debe contener al menos 8 carácteres")
    .custom(async (value, { req }) => {
      const user = await User.findOne({ _id: req.body.userId });
      const existingUser = await User.findOne({ username: value });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return Promise.reject("Ya existe un usuario con este identificador");
      } else if (value == user.username) {
        return Promise.reject("Elije un nombre de usuario distinto");
      } else {
        return Promise.resolve();
      }
    }),
  validation.validate,
  tokenHandler.verifyToken,
  userController.editUserName
);

module.exports = router;
