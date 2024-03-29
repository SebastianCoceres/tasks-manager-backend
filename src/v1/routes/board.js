const router = require("express").Router();
const tokenHandler = require("../handlers/tokenHandler");
const boardController = require("../controllers/board");
const { param } = require("express-validator");
const validation = require("../handlers/validation");

router.post("/", tokenHandler.verifyToken, boardController.create);
router.get("/", tokenHandler.verifyToken, boardController.getAll);
router.put("/", tokenHandler.verifyToken, boardController.updatePosition);
router.get(
  "/favourites",
  tokenHandler.verifyToken,
  boardController.getFavourites
);

router.put(
  "/favourites",
  tokenHandler.verifyToken,
  boardController.updateFavouritesPosition
);


router.get(
  "/:boardId",
  param("boardId").custom((value) => {
    if (!validation.isObjectId(value)) {
      return Promise.reject("invalid id");
    } else return Promise.resolve();
  }),
  validation.validate,
  tokenHandler.verifyToken,
  boardController.getOne
);

router.put(
  "/:boardId",
  param("boardId").custom((value) => {
    if (!validation.isObjectId(value)) {
      return Promise.reject("invalid id");
    } else return Promise.resolve();
  }),
  validation.validate,
  tokenHandler.verifyToken,
  boardController.update
);

router.delete(
  "/:boardId",
  param("boardId").custom((value) => {
    if (!validation.isObjectId(value)) {
      return Promise.reject("invalid id");
    } else return Promise.resolve();
  }),
  validation.validate,
  tokenHandler.verifyToken,
  boardController.delete
);

module.exports = router;
