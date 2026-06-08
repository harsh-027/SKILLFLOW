const express = require("express");
const { sendMessage, getConversation } = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const {
  conversationParamValidator,
  createMessageValidator,
} = require("../validators/platformValidators");

const router = express.Router();

router.post("/", authMiddleware, createMessageValidator, validateRequest, sendMessage);
router.get("/:userId", authMiddleware, conversationParamValidator, validateRequest, getConversation);

module.exports = router;
