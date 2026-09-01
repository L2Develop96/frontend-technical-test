// Handles the two conversation routes that the routes.json rewrites break.
//
// State is read and written through req.app.db (json-server exposes the live
// lowdb instance there). Requiring db.json directly would give a snapshot cached
// by CommonJS at startup, so conversations created at runtime and updated
// lastMessageTimestamp values would never show up here, while /conversation/:id
// and /messages/:id would serve live data.
const isConversationsCollection = (url) => /^\/conversations(\?|$)/.test(url);

// GET /conversations/:userId is rewritten to /conversations?senderId=:userId,
// which cannot express "the user is either sender or recipient".
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

// DELETE /conversation/:id is rewritten to /conversations?id=:id, a collection
// query, so json-server's own /:id delete handler is never reached and the
// request 404s. Messages are removed alongside the conversation: no endpoint can
// return or clean up messages whose conversation is gone.
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
