const express = require("express");
const { getLandingStats } = require("../controllers/publicController");

const router = express.Router();

router.get("/landing", getLandingStats);

module.exports = router;
