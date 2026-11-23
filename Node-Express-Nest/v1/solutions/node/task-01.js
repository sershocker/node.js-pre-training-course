const { timeStamp } = require("console");
const EventEmitter = require("events");
const Path = require("path");
const fs = require("fs/promises");

/**
 * Custom Event Emitter for a messaging system
 * Extend Node.js EventEmitter to create a pub-sub messaging system
 */

class MessagePersistence {
  constructor(path = Path.join("data", "messages.json")) {
    this.path = path;
  }

  async saveMessages(messages) {
    await fs.mkdir(Path.dirname(this.path), { recursive: true });
    await fs.writeFile(this.path, JSON.stringify(messages, null, 2), "utf-8");
  }

  async loadMessages() {
    try {
      const rawData = await fs.readFile(this.path, "utf-8");
      const data = JSON.parse(rawData);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error?.code === "ENOENT") return [];
      throw new Error(error?.code ? error.code.toString() : error.message);
    }
  }
}

class MessageSystem extends EventEmitter {
  constructor() {
    super();
    // Initialize the messaging system
    this.messagePersistence = new MessagePersistence();
    this.messages = [];
    this.users = new Set();
    this._messageLoading();
  }

  async _messageLoading() {
    const loadedMessages = await this.messagePersistence.loadMessages();
    this.messages = [...loadedMessages, ...this.messages];
  }

  async messageSaving() {
    try {
      await this.messagePersistence.saveMessages(this.messages);
    } catch (error) {
      this.emit("saving-error", error);
    }
  }

  /**
   * Send a message to the system
   *
   * Create a message object with id, type, content, timestamp, sender
   * Add message to messages array
   * Keep only last 100 messages for memory management
   * Emit the message event and specific type event
   *
   * @param {string} type - Message type ('message', 'notification', 'alert')
   * @param {string} content - Message content
   * @param {string} sender - Optional sender name
   * @returns {object} Created message object
   */
  sendMessage(type, content, sender = "System") {
    const message = {
      id: Date.now(),
      type: type,
      content: content,
      timestamp: Date.now(),
      sender: sender,
    };
    if (this.messages.length >= 100) {
      this.messages.shift();
    }
    this.messages.push(message);
    this.emit("message", message);
    this.emit(type, message);
    this.messageSaving();
    return message;
  }

  /**
   * Subscribe to all message types
   *
   * Listen to all messages using the 'message' event
   *
   * @param {function} callback - Callback function to handle messages
   */
  subscribeToMessages(callback) {
    this.on("message", callback);
  }

  /**
   * Subscribe to specific message type
   *
   *  Listen to specific message type events
   *
   * @param {string} type - Message type to subscribe to
   * @param {function} callback - Callback function to handle messages
   */
  subscribeToType(type, callback) {
    this.on(type, callback);
  }

  /**
   * Get current number of active users
   *
   * Return the number of users
   *
   * @returns {number} Number of active users
   */
  getUserCount() {
    return this.users.size;
  }

  /**
   * Get the last N messages (default 10)
   *
   * Return the last 'count' messages
   *
   * @param {number} count - Number of messages to retrieve
   * @returns {array} Array of recent messages
   */
  getMessageHistory(count = 10) {
    return this.messages.slice(-count);
  }

  /**
   * Add a user to the system
   *
   * Add user to users set (avoid duplicates)
   * Create and emit user-joined event
   *
   * @param {string} username - Username to add
   */
  addUser(username) {
    if (!this.users.has(username)) {
      this.users.add(username);
      this.sendMessage("user-joined", `${username} was added`);
    }
  }

  /**
   * Remove a user from the system
   *
   * Remove user from users set
   * Create and emit user-left event
   *
   * @param {string} username - Username to remove
   */
  removeUser(username) {
    if (this.users.has(username)) {
      this.users.delete(username);
      this.sendMessage("user-left", `${username} was deleted`);
    }
  }

  /**
   * Get all active users
   *
   * Convert users Set to Array and return
   *
   * @returns {array} Array of usernames
   */
  getActiveUsers() {
    return [...this.users];
  }

  /**
   * Clear all messages
   *
   * Clear messages array
   * Emit history-cleared event
   */
  clearHistory() {
    this.messages = [];
    this.emit(`message history was cleared`);
    this.messageSaving();
  }

  /**
   * Get system statistics
   *
   * Calculate and return statistics
   *
   * @returns {object} System stats
   */
  getStats() {
    return {
      totalMessages: this.messages.length,
      activeUsers: this.users.size,
      messagesByType: Object.groupBy(this.messages, (obj) => obj.type),
    };
  }
}

// Export the MessageSystem class
module.exports = MessageSystem;

// Example usage (for testing):
const isReadyToTest = true;

if (isReadyToTest) {
  const messenger = new MessageSystem();

  // Subscribe to all messages
  messenger.subscribeToMessages((message) => {
    console.log(`[${message.type.toUpperCase()}] ${message.content}`);
  });

  // Subscribe to specific alert messages
  messenger.subscribeToType("alert", (message) => {
    console.log(`🚨 ALERT: ${message.content}`);
  });

  // Subscribe to user events
  messenger.subscribeToType("user-joined", (message) => {
    console.log(`👋 ${message.content}`);
  });

  messenger.subscribeToType("user-left", (message) => {
    console.log(`👋 ${message.content}`);
  });

  // Add users
  messenger.addUser("Alice");
  messenger.addUser("Bob");

  // Send various messages
  messenger.sendMessage("message", "Hello everyone!", "Alice");
  messenger.sendMessage("notification", "System maintenance in 1 hour");
  messenger.sendMessage("alert", "Server overload detected!");

  // Remove user
  messenger.removeUser("Bob");

  // Check system status
  console.log(`\nActive users: ${messenger.getUserCount()}`);
  console.log("Recent messages:", messenger.getMessageHistory()?.length);
  console.log("System stats:", messenger.getStats());

  messenger.messageSaving();
}
