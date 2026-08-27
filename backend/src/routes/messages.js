const express = require("express");
const router = express.Router();
const messageStore = require("../services/messageStore");

router.get("/:userId/history", (req, res) => {
  console.log("[Messages] Getting message history for user", req.params.userId);
  const userId = req.params.userId;
  const history = messageStore.getHistory(userId);
  res.json({ userId, totalMessages: history.length, history });
});

module.exports = router;
