// villages.controller.js
const pool = require('../config/db.config');

// Create village (with auto-normalization handled by DB)
// exports.createVillage = async (req, res) => {
//   const { name, city_id, pincode, created_by } = req.body;
//   if (!name || !city_id || !pincode || !created_by) {
//     return res.status(400).json({ message: 'name, city_id, pincode, and created_by are required.' });
//   }

//   try {
//     const result = await pool.query(
//       `INSERT INTO villages (name, city_id, pincode, created_by)
//        VALUES ($1, $2, $3, $4) RETURNING *`,
//       [name.trim(), city_id, pincode.trim(), created_by]
//     );

//     res.status(201).json({ message: 'Village created successfully.', village: result.rows[0] });
//   } catch (error) {
//     if (error.code === '23505') {
//       return res.status(409).json({ message: 'Village with same name and pincode already exists in this city.' });
//     }
//     console.error('Create error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


// Create village with automatic state/city creation if missing, without created_by
exports.createVillage = async (req, res) => {
  let { state_name, city_name, name, pincode } = req.body;

  if (!state_name || !city_name || !name || !pincode) {
    return res.status(400).json({ message: 'state_name, city_name, name, pincode are required.' });
  }

  state_name = state_name.trim();
  city_name = city_name.trim();
  name = name.trim();
  pincode = pincode.trim();

  try {
    // 1. Check or create state (no created_by)
    let stateResult = await pool.query('SELECT id FROM states WHERE LOWER(name) = LOWER($1)', [state_name]);
    let state_id;
    if (stateResult.rows.length === 0) {
      const insertedState = await pool.query(
        'INSERT INTO states (name) VALUES ($1) RETURNING id',
        [state_name]
      );
      state_id = insertedState.rows[0].id;
    } else {
      state_id = stateResult.rows[0].id;
    }

    // 2. Check or create city (no created_by)
    let cityResult = await pool.query(
      'SELECT id FROM cities WHERE LOWER(name) = LOWER($1) AND state_id = $2',
      [city_name, state_id]
    );
    let city_id;
    if (cityResult.rows.length === 0) {
      const insertedCity = await pool.query(
        'INSERT INTO cities (name, state_id) VALUES ($1, $2) RETURNING id',
        [city_name, state_id]
      );
      city_id = insertedCity.rows[0].id;
    } else {
      city_id = cityResult.rows[0].id;
    }

    // 3. Check if village exists with same name and pincode in city
    const villageExists = await pool.query(
      `SELECT id FROM villages 
       WHERE city_id = $1 AND LOWER(name) = LOWER($2) AND pincode = $3`,
      [city_id, name, pincode]
    );

    if (villageExists.rows.length > 0) {
      return res.status(409).json({ message: 'Village with same name and pincode already exists in this city.' });
    }

    // 4. Insert village (no created_by)
    const result = await pool.query(
      `INSERT INTO villages (name, city_id, pincode)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, city_id, pincode]
    );

    res.status(201).json({ message: 'Village created successfully.', village: result.rows[0] });

  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all villages, optionally filtered by city_id
exports.getVillages = async (req, res) => {
  const { city_id } = req.query;

  try {
    let query = `
      SELECT v.*, c.name AS city_name 
      FROM villages v
      JOIN cities c ON v.city_id = c.id
    `;
    let params = [];

    if (city_id) {
      query += ' WHERE v.city_id = $1';
      params.push(city_id);
    }

    const result = await pool.query(query, params);
    res.status(200).json({ villages: result.rows });

  } catch (error) {
    console.error('Get error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a village
// exports.updateVillage = async (req, res) => {
//   const { id } = req.params;
//   const { name, pincode, is_enabled, updated_by } = req.body;

//   try {
//     const existing = await pool.query('SELECT * FROM villages WHERE id = $1', [id]);
//     if (existing.rows.length === 0) {
//       return res.status(404).json({ message: 'Village not found.' });
//     }

//     const old = existing.rows[0];
//     const newName = name !== undefined ? name.trim() : old.name;
//     const newPincode = pincode !== undefined ? pincode.trim() : old.pincode;
//     const newIsEnabled = is_enabled !== undefined ? is_enabled : old.is_enabled;

//     // Check uniqueness conflict excluding current village
//     const conflict = await pool.query(
//       `SELECT id FROM villages 
//        WHERE city_id = $1 AND LOWER(TRIM(name)) = LOWER(TRIM($2)) AND pincode = $3 AND id != $4`,
//       [old.city_id, newName, newPincode, id]
//     );

//     if (conflict.rows.length > 0) {
//       return res.status(409).json({ message: 'Another village with the same name and pincode exists in this city.' });
//     }

//     // Update village with updated_by info
//     const updated = await pool.query(
//       `UPDATE villages SET name = $1, pincode = $2, is_enabled = $3, updated_by = $4, updated_at = NOW()
//        WHERE id = $5 RETURNING *`,
//       [newName, newPincode, newIsEnabled, updated_by, id]
//     );

//     res.status(200).json({ message: 'Village updated successfully.', village: updated.rows[0] });

//   } catch (error) {
//     console.error('Update error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
exports.updateVillage = async (req, res) => {
  const { id } = req.params;
  const { name, pincode, is_enabled, updated_by } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM villages WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Village not found.' });
    }

    const old = existing.rows[0];
    const newName = name !== undefined ? name.trim() : old.name;
    const newPincode = pincode !== undefined ? pincode.trim() : old.pincode;
    const newIsEnabled = is_enabled !== undefined ? is_enabled : old.is_enabled;

    // Check uniqueness conflict excluding current village
    const conflict = await pool.query(
      `SELECT id FROM villages 
       WHERE city_id = $1 AND LOWER(TRIM(name)) = LOWER(TRIM($2)) AND pincode = $3 AND id != $4`,
      [old.city_id, newName, newPincode, id]
    );

    if (conflict.rows.length > 0) {
      return res.status(409).json({ message: 'Another village with the same name and pincode exists in this city.' });
    }

    // Update village with updated_by info
    const updated = await pool.query(
      `UPDATE villages SET name = $1, pincode = $2, is_enabled = $3, updated_by = $4, updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [newName, newPincode, newIsEnabled, updated_by, id]
    );

    res.status(200).json({ message: 'Village updated successfully.', village: updated.rows[0] });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Enable/Disable village (toggle status)
exports.toggleVillageStatus = async (req, res) => {
  const { id } = req.params;
  const { is_enabled, updated_by } = req.body;

  try {
    const result = await pool.query(
      `UPDATE villages SET is_enabled = $1, updated_by = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [is_enabled, updated_by, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Village not found.' });
    }

    res.status(200).json({ message: 'Village status updated.', village: result.rows[0] });
  } catch (error) {
    console.error('Toggle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete village
exports.deleteVillage = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM villages WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Village not found.' });
    }

    res.status(200).json({ message: 'Village deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// Get all villages (optionally filtered by city_id)
exports.getVillages = async (req, res) => {
  const { city_id } = req.query;

  try {
    let query = `SELECT v.*, c.name as city_name FROM villages v
                 JOIN cities c ON v.city_id = c.id`;
    let params = [];

    if (city_id) {
      query += ` WHERE v.city_id = $1`;
      params.push(city_id);
    }

    const result = await pool.query(query, params);
    res.status(200).json({ villages: result.rows });
  } catch (error) {
    console.error('Get error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a village
exports.updateVillage = async (req, res) => {
  const { id } = req.params;
  const { name, pincode, is_enabled, updated_by } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM villages WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Village not found.' });
    }

    const old = existing.rows[0];
    const newName = name !== undefined ? name.trim() : old.name;
    const newPincode = pincode !== undefined ? pincode.trim() : old.pincode;
    const newIsEnabled = is_enabled !== undefined ? is_enabled : old.is_enabled;

    // Check for uniqueness conflict
    const conflict = await pool.query(
      `SELECT id FROM villages WHERE city_id = $1 AND normalized_name = LOWER(TRIM($2)) AND pincode = $3 AND id != $4`,
      [old.city_id, newName, newPincode, id]
    );

    if (conflict.rows.length > 0) {
      return res.status(409).json({ message: 'Another village with the same name and pincode exists in this city.' });
    }

    const updated = await pool.query(
      `UPDATE villages SET name = $1, pincode = $2, is_enabled = $3, updated_by = $4, updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [newName, newPincode, newIsEnabled, updated_by, id]
    );

    res.status(200).json({ message: 'Village updated successfully.', village: updated.rows[0] });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Enable/Disable village (toggle status)
exports.toggleVillageStatus = async (req, res) => {
  const { id } = req.params;
  const { is_enabled, updated_by } = req.body;

  try {
    const result = await pool.query(
      `UPDATE villages SET is_enabled = $1, updated_by = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [is_enabled, updated_by, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Village not found.' });
    }

    res.status(200).json({ message: 'Village status updated.', village: result.rows[0] });
  } catch (error) {
    console.error('Toggle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete village
exports.deleteVillage = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM villages WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Village not found.' });
    }

    res.status(200).json({ message: 'Village deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
