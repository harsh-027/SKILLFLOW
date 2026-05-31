const express = require("express");
const { sendMessage, getConversation } = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, sendMessage);
router.get("/:userId", authMiddleware, getConversation);

module.exports = router;
