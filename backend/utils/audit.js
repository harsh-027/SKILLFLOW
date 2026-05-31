const AuditLog = require("../models/AuditLog");
const { getClientIp } = require("./securityEvents");

const recordAuditLog = async (req, action, targetId, metadata = {}) => {
  if (!req.user?._id) {
    return;
  }

  await AuditLog.create({
    adminId: req.user._id,
    action,
    targetId: targetId || null,
    metadata,
    ipAddress: getClientIp(req),
  });
};

module.exports = { recordAuditLog };
