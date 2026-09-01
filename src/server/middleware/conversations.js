const isConversationsCollection = (url) => /^\/conversations(\?|$)/.test(url);

const listForUser = (req, res) => {
  const userId = req.query.senderId;
  const { conversations = [] } = req.app.db.getState();

  res.status(200).json(
    conversations.filter(
      (conv) =>
        String(conv.senderId) === String(userId) ||
        String(conv.recipientId) === String(userId),
    ),
  );
};

const removeConversation = (req, res) => {
  const conversationId = req.query.id;
  const db = req.app.db;
  const { conversations = [] } = db.getState();

  const target = conversations.find(
    (conv) => String(conv.id) === String(conversationId),
  );

  if (!target) {
    res.status(404).json({});
    return;
  }

  db.get('conversations')
    .remove((conv) => String(conv.id) === String(conversationId))
    .write();

  db.get('messages')
    .remove((message) => String(message.conversationId) === String(conversationId))
    .write();

  res.status(200).json(target);
};

module.exports = (req, res, next) => {
  if (!isConversationsCollection(req.url)) {
    next();
    return;
  }

  if (req.method === 'GET' && req.query.senderId !== undefined) {
    listForUser(req, res);
    return;
  }

  if (req.method === 'DELETE' && req.query.id !== undefined) {
    removeConversation(req, res);
    return;
  }

  next();
};
