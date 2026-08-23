const { queryAll, queryOne, runStatement } = require('../config/database');

/**
 * ContactMessage model — CRUD operations for the contact_messages table.
 * Stores anonymous contact form submissions with sender IP.
 */
const ContactMessage = {
  /**
   * Get all contact messages, ordered by newest first.
   */
  getAll() {
    return queryAll('SELECT * FROM contact_messages ORDER BY timestamp DESC');
  },

  /**
   * Create a new contact message.
   * @param {Object} data - { sender_ip, message }
   */
  create({ sender_ip, message }) {
    const result = runStatement(
      'INSERT INTO contact_messages (sender_ip, message) VALUES (?, ?)',
      [sender_ip, message]
    );
    return queryOne('SELECT * FROM contact_messages WHERE id = ?', [result.lastInsertRowid]);
  },

  /**
   * Delete a contact message by ID.
   * @param {number} id - The message's ID
   */
  delete(id) {
    return runStatement('DELETE FROM contact_messages WHERE id = ?', [id]);
  },

  /**
   * Count total messages.
   */
  count() {
    const row = queryOne('SELECT COUNT(*) as total FROM contact_messages');
    return row ? row.total : 0;
  }
};

module.exports = ContactMessage;
