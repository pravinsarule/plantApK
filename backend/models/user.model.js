const db = require('../config/db.config');
const bcrypt = require('bcryptjs');

/**
 * User Model
 */
class User {
  constructor(user) {
    this.username = user.username;
    this.email = user.email;
    this.password = user.password;
  }

  /**
   * Create a new user
   * @returns {Promise} The created user object
   */
  async create() {
    // Hash password before saving to database
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    const query = `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
    `;

    try {
      const { rows } = await db.query(query, [
        this.username,
        this.email,
        this.password
      ]);
      return rows[0];
    } catch (error) {
      if (error.code === '23505') { // unique_violation
        if (error.detail.includes('email')) {
          throw new Error('Email already exists');
        }
        if (error.detail.includes('username')) {
          throw new Error('Username already exists');
        }
      }
      throw error;
    }
  }

  /**
   * Find a user by email
   * @param {string} email - User email
   * @returns {Promise} User object
   */
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0];
  }

  /**
   * Find a user by ID
   * @param {number} id - User ID
   * @returns {Promise} User object
   */
  static async findById(id) {
    const query = 'SELECT id, username, email, created_at FROM users WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  /**
   * Compare password with hashed password in database
   * @param {string} password - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} True if password matches
   */
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;