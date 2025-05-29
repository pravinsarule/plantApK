const pool = require('../config/db.config');

// Get all addresses for the logged-in user
const getAllAddresses = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY is_default DESC, updated_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a specific address by ID (only if it belongs to the user)
const getAddressById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_addresses WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/**
 * Create a new address for a user
 */
// Create a new address
const createAddress = async (req, res) => {
  try {
    const user_id = req.user?.id; // Get user ID from token (via middleware)

    const {
      name,
      phone,
      village,
      landmark,
      address,
      city,
      state,
      pincode,
      country = 'India',
      is_default = false,
    } = req.body;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized - userId missing' });
    }

    // If user wants this address as default, unset previous default addresses
    if (is_default) {
      await pool.query(
        'UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1',
        [user_id]
      );
    }

    // Insert new address
    const result = await pool.query(
      `INSERT INTO user_addresses 
        (user_id, name, phone, village, landmark, address, city, state, pincode, country, is_default) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        user_id,
        name,
        phone,
        village,
        landmark,
        address,
        city,
        state,
        pincode,
        country,
        is_default
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating address:', err.message);
    res.status(500).json({ error: 'Failed to create address' });
  }
};

module.exports = {
  createAddress,
};


// Update an existing address (only if it belongs to the user)
// Update address for logged-in user
const updateAddress = async (req, res) => {
  try {
    const user_id = req.user?.id; // Get user ID from token
    const address_id = req.params.id; // Address ID from route

    const {
      name,
      phone,
      village,
      landmark,
      address,
      city,
      state,
      pincode,
      country = 'India',
      is_default = false,
    } = req.body;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized - userId missing' });
    }

    // If is_default is set to true, unset other default addresses for this user
    if (is_default) {
      await pool.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1', [user_id]);
    }

    const result = await pool.query(
      `UPDATE user_addresses SET
        name = $1,
        phone = $2,
        village = $3,
        landmark = $4,
        address = $5,
        city = $6,
        state = $7,
        pincode = $8,
        country = $9,
        is_default = $10,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 AND user_id = $12
       RETURNING *`,
      [
        name,
        phone,
        village,
        landmark,
        address,
        city,
        state,
        pincode,
        country,
        is_default,
        address_id,
        user_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating address:', err.message);
    res.status(500).json({ error: 'Failed to update address' });
  }
};



// Delete an address (only if it belongs to the user)
const deleteAddress = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found or unauthorized' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};
