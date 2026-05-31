const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");

const createSwapRequest = async (req, res) => {
  try {
    const { receiverId, skillOffered, skillWanted } = req.body;

    if (!receiverId || !skillOffered || !skillWanted) {
      return res.status(400).json({
        message: "receiverId, skillOffered and skillWanted are required",
      });
    }

    if (receiverId === req.user.id) {
      return res.status(400).json({ message: "You cannot create a swap request for yourself" });
    }

    const receiverUser = await User.findById(receiverId);
    if (!receiverUser) {
      return res.status(404).json({ message: "Receiver user not found" });
    }

    const existingPending = await SwapRequest.findOne({
      sender: req.user.id,
      receiver: receiverId,
      skillOffered: skillOffered.trim(),
      skillWanted: skillWanted.trim(),
      status: "pending",
    });

    if (existingPending && existingPending.receiver.toString() === receiverId) {
      return res.status(409).json({ message: "You already sent a pending request to this user" });
    }

    const swapRequest = await SwapRequest.create({
      sender: req.user.id,
      receiver: receiverId,
      skillOffered: skillOffered.trim(),
      skillWanted: skillWanted.trim(),
      // Legacy mirrors for old UI/read paths.
      offeredSkill: skillOffered.trim(),
      requestedSkill: skillWanted.trim(),
      status: "pending",
    });

    const populated = await swapRequest.populate([
      { path: "sender", select: "name email avatar" },
      { path: "receiver", select: "name email avatar" },
    ]);

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create swap request", error: error.message });
  }
};

const getMySwapRequests = async (req, res) => {
  try {
    const query =
      req.query.type === "sent"
        ? { sender: req.user.id }
        : { receiver: req.user.id };

    const requests = await SwapRequest.find(query)
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch swap requests", error: error.message });
  }
};

const acceptSwapRequest = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);
    if (!swapRequest) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    if (swapRequest.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not allowed to accept this request" });
    }

    if (swapRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Cannot accept a request with status '${swapRequest.status}'` });
    }

    // Backfill legacy requests that predate skillOffered/skillWanted fields.
    if (!swapRequest.skillOffered) {
      swapRequest.skillOffered = swapRequest.offeredSkill || "Not specified";
    }
    if (!swapRequest.skillWanted) {
      swapRequest.skillWanted = swapRequest.requestedSkill || "Not specified";
    }

    swapRequest.status = "accepted";
    await swapRequest.save();

    return res.status(200).json({ message: "Swap request accepted", swapRequest });
  } catch (error) {
    return res.status(500).json({ message: "Failed to accept swap request", error: error.message });
  }
};

const rejectSwapRequest = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);
    if (!swapRequest) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    if (swapRequest.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not allowed to reject this request" });
    }

    if (swapRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Cannot reject a request with status '${swapRequest.status}'` });
    }

    // Backfill legacy requests that predate skillOffered/skillWanted fields.
    if (!swapRequest.skillOffered) {
      swapRequest.skillOffered = swapRequest.offeredSkill || "Not specified";
    }
    if (!swapRequest.skillWanted) {
      swapRequest.skillWanted = swapRequest.requestedSkill || "Not specified";
    }

    swapRequest.status = "rejected";
    await swapRequest.save();

    return res.status(200).json({ message: "Swap request rejected", swapRequest });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reject swap request", error: error.message });
  }
};

const deleteSwapRequest = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);
    if (!swapRequest) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    const isSender = swapRequest.sender.toString() === req.user.id;
    const isReceiver = swapRequest.receiver.toString() === req.user.id;

    if (!isSender && !isReceiver) {
      return res.status(403).json({ message: "You are not allowed to delete this request" });
    }

    await SwapRequest.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Swap request deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete swap request", error: error.message });
  }
};

module.exports = {
  createSwapRequest,
  getMySwapRequests,
  acceptSwapRequest,
  rejectSwapRequest,
  deleteSwapRequest,
};
