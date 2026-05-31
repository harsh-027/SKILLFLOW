const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const { createExchangeValidator, objectIdParam } = require("../validators/platformValidators");
const {
  createExchange,
  getMyExchanges,
  updateExchangeStatus,
} = require("../controllers/exchangeController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getMyExchanges);
router.post("/", createExchangeValidator, validateRequest, createExchange);
router.patch("/:id/status", objectIdParam(), validateRequest, updateExchangeStatus);

module.exports = router;
