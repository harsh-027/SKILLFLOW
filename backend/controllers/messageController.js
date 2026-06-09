const Message = require("../models/Message");
const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");

const hasAcceptedSwap = async (userA, userB) => {
  const match = await SwapRequest.exists({
    status: "accepted",
    $or: [
      { sender: userA, receiver: userB },
      { sender: userB, receiver: userA },
    ],
  });

  return Boolean(match);
};

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;
    const trimmedContent = typeof content === "string" ? content.trim() : "";

    if (!receiverId || !trimmedContent) {
      return res.status(400).json({ message: "receiverId and content are required" });
    }

    if (receiverId === senderId) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver user not found" });
    }

    const canMessage = await hasAcceptedSwap(senderId, receiverId);
    if (!canMessage) {
      return res.status(403).json({ message: "Messaging is only allowed between matched users" });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: trimmedContent,
    });

    const populated = await message.populate([
      { path: "sender", select: "name avatar profileImage" },
      { path: "receiver", select: "name avatar profileImage" },
    ]);

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};

const getConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    if (!otherUserId) {
      return res.status(400).json({ message: "userId param is required" });
    }

    if (otherUserId === currentUserId) {
      return res.status(200).json([]);
    }

    const canMessage = await hasAcceptedSwap(currentUserId, otherUserId);
    if (!canMessage) {
      return res.status(403).json({ message: "Messaging is only allowed between matched users" });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .populate("sender", "name avatar profileImage")
      .populate("receiver", "name avatar profileImage")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch conversation", error: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversation,
};
