const router = require("express").Router({ mergeParams: true });
const tokenHandler = require("../handlers/tokenHandler");
const taskController = require("../controllers/task");
const { param, body } = require("express-validator");
const validation = require("../handlers/validation");

router.get(
  "/inCalendar",
  tokenHandler.verifyToken,
  taskController.getTasksInCalendar
);
router.post(
  "/betweenDates",
  body("startDate").custom((value, { req }) => {
    const startDate = new Date(value);
    const endDate = new Date(req.body.endDate);
    if (startDate > endDate) {
      return Promise.reject(
        "Fecha de inicio no puede ser mayor que fecha de fin"
      );
    } else {
      return Promise.resolve();
    }
  }),
  validation.validate,
  tokenHandler.verifyToken,
  taskController.getTasksBetweenDates
);

router.post(
  "/generate-pdf",
  body("boardId").custom((value) => {
    if (!validation.isObjectId(value)) {
      return Promise.reject("invalid id");
    } else return Promise.resolve();
  }),
  body("tasks").notEmpty(),
  body("start").notEmpty(),
  body("end").notEmpty(),
  validation.validate,
  tokenHandler.verifyToken,
  taskController.generatePDF
);

router.post(
  "/",
  param("boardId").custom((value) => {
    if (!validation.isObjectId(value)) {
      return Promise.reject("invalid board id");
    } else return Promise.resolve();
  }),
  body("sectionId").custom((value) => {
    if (!validation.isObjectId(value)) {
      return Promise.reject("invalid section id");
    } else return Promise.resolve();
  }),
  validation.validate,
  tokenHandler.verifyToken,
  taskController.create
);

router.put(
  "/update-position",
  param("boardId").custom((value) => {
    if (!validation.isObjectId(value)) {
      return Promise.reject("invalid board id");
    } else return Promise.resolve();
  }),

  validation.validate,
  tokenHandler.verifyToken,
  taskController.updatePosition
);

router.delete(
  "/:taskId",
  param("boardId").custom((value) => {
    if (!validation.isObjectId(value)) {
      return Promise.reject("invalid board id");
    } else return Promise.resolve();
  }),
  param("taskId").custom((value) => {
    if (!validation.isObjectId(value)) {
      return Promise.reject("invalid task id");
    } else return Promise.resolve();
  }),
  validation.validate,
  tokenHandler.verifyToken,
  taskController.delete
);

router.put(
  "/:taskId",
  param("boardId").custom((value) => {
    if (!validation.isObjectId(value)) {
      return Promise.reject("invalid board id");
    } else return Promise.resolve();
  }),
  param("taskId").custom((value) => {
    if (!validation.isObjectId(value)) {
      return Promise.reject("invalid task id");
    } else return Promise.resolve();
  }),
  validation.validate,
  tokenHandler.verifyToken,
  taskController.update
);

module.exports = router;
