const express = require("express");
const router = express.Router();
const messageStore = require("../services/messageStore");

// List every conversation the agent has, most recently active first.
// Powers the dashboard's Conversations panel.
router.get("/", (req, res) => {
  console.log("[Messages] Listing all conversations");
  const conversations = messageStore.getAllConversations();
  res.json({ total: conversations.length, conversations });
});

router.get("/:userId/history", (req, res) => {
  console.log("[Messages] Getting message history for user", req.params.userId);
  const userId = req.params.userId;
  const conversation = messageStore.getConversation(userId);
  const history = conversation ? conversation.history : [];
  res.json({
    userId,
    platform: conversation ? conversation.platform : null,
    totalMessages: history.length,
    history,
  });
});

module.exports = router;
