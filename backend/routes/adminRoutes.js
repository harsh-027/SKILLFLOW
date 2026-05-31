const express = require("express");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const { objectIdParam, adminToggleValidator } = require("../validators/platformValidators");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/users", adminController.getAllUsers);
router.get("/dashboard", adminController.getDashboard);
router.delete("/users/:id", objectIdParam(), validateRequest, adminController.deleteUser);
router.patch("/users/:id/ban", adminToggleValidator, validateRequest, adminController.toggleUserBan);
router.patch("/users/:id/verify", adminToggleValidator, validateRequest, adminController.verifyUser);

router.get("/listings", adminController.getAllListings);
router.delete("/listings/:id", objectIdParam(), validateRequest, adminController.removeListing);

router.get("/exchanges", adminController.getAllExchanges);
router.patch("/exchanges/:id/cancel", objectIdParam(), validateRequest, adminController.cancelExchange);

router.get("/reports", adminController.getAllReports);
router.patch("/reports/:id/resolve", objectIdParam(), validateRequest, adminController.resolveReport);

router.delete("/reviews/:id", objectIdParam(), validateRequest, adminController.deleteReview);

router.get("/analytics", adminController.getAnalytics);

module.exports = router;
