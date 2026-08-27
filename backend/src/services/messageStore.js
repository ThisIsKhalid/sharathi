const HISTORY_LIMIT = 10;
const store = new Map();

module.exports = {
  addMessage: (userId, role, text) => {
    if (!store.has(userId)) {
      store.set(userId, []);
    }

    const history = store.get(userId);
    history.push({ role, content: text });

    if (history.length > HISTORY_LIMIT) {
      history.shift();
    }

    store.set(userId, history);
  },

  getHistory: (userId) => {
    return store.get(userId) || [];
  },

  clearHistory: (userId) => {
    store.delete(userId);
  },

  getStats: () => {
    return {
      activeUsers: store.size,
    };
  },
};
