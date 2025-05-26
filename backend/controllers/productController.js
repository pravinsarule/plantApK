
const pool = require('../config/db');



exports.addProduct = async (req, res) => {
  try {
    const {
      category_id, sub_category_id, name_en, name_hi, name_mr,
      description, technical_name, brand, manufacturer,
      mrp, selling_price, pack_size, pack_type, unit_per_pack,
      sku, stock_quantity, minimum_order_quantity, recommended_crops,
      primary_image_url, video_url, status, is_prescription_required, is_banned
    } = req.body;

    const { id: userId, role } = req.user;

    if (!['vendor', 'company'].includes(role)) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    // Helper function to safely parse numbers
    const toInt = (val) => {
      const num = parseInt(val);
      return isNaN(num) ? null : num;
    };

    const toFloat = (val) => {
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    };

    // Image paths (from multer)
    const imagePaths = req.files?.map(file => `/uploads/${file.filename}`) || [];

    const result = await pool.query(
      `INSERT INTO products (
        vendor_id, category_id, sub_category_id,
        name_en, name_hi, name_mr, description, technical_name,
        brand, manufacturer, mrp, selling_price,
        pack_size, pack_type, unit_per_pack, sku,
        stock_quantity, minimum_order_quantity,
        recommended_crops, primary_image_url, images, video_url,
        status, is_prescription_required, is_banned
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6, $7, $8,
        $9, $10, $11, $12,
        $13, $14, $15, $16,
        $17, $18,
        $19, $20, $21, $22,
        $23, $24, $25
      ) RETURNING *`,
      [
        userId,
        toInt(category_id),
        toInt(sub_category_id),
        name_en,
        name_hi || null,
        name_mr || null,
        description || null,
        technical_name || null,
        brand || null,
        manufacturer || null,
        toFloat(mrp),
        toFloat(selling_price),
        pack_size || null,
        pack_type || null,
        toInt(unit_per_pack),
        sku || null,
        toInt(stock_quantity),
        toInt(minimum_order_quantity),
        recommended_crops ? recommended_crops.split(',').map(cropId => toInt(cropId)).filter(Boolean) : [],
        primary_image_url || null,
        JSON.stringify(imagePaths),
        video_url || null,
        status || 'active',
        is_prescription_required === 'true',
        is_banned === 'true'
      ]
    );

    res.status(201).json({
      message: 'Product added successfully',
      product: result.rows[0]
    });

  } catch (err) {
    console.error('Error adding product:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};





// // DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { id: userId } = req.user;

    const result = await pool.query(
      `DELETE FROM products WHERE id = $1 AND vendor_id = $2 RETURNING *`,
      [productId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    res.json({ message: 'Product deleted successfully' });

  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};



// // GET /api/products?category_id=&sub_category_id=
exports.getProducts = async (req, res) => {
  try {
    const { category_id, sub_category_id } = req.query;

    // Base query and params array
    let query = `SELECT * FROM products WHERE 1=1`;
    const params = [];
    let idx = 1;

    // Filter by category_id if provided
    if (category_id) {
      query += ` AND category_id = $${idx}`;
      params.push(category_id);
      idx++;
    }

    // Filter by sub_category_id if provided
    if (sub_category_id) {
      query += ` AND sub_category_id = $${idx}`;
      params.push(sub_category_id);
      idx++;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);

    res.json({
      count: result.rows.length,
      products: result.rows
    });
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { id: userId, role } = req.user;

    // Allow only vendors or companies to update
    if (!['vendor', 'company'].includes(role)) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    // Ensure product belongs to the current vendor
    const existing = await pool.query(
      `SELECT * FROM products WHERE id = $1 AND vendor_id = $2`,
      [productId, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    const fields = req.body;
    const keys = [];
    const values = [];

    const toInt = (val) => {
      const num = parseInt(val);
      return isNaN(num) ? null : num;
    };

    const toFloat = (val) => {
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    };

    const fieldParsers = {
      category_id: toInt,
      sub_category_id: toInt,
      mrp: toFloat,
      selling_price: toFloat,
      unit_per_pack: toInt,
      stock_quantity: toInt,
      minimum_order_quantity: toInt,
      is_prescription_required: (val) => val === 'true' || val === true,
      is_banned: (val) => val === 'true' || val === true,
      recommended_crops: (val) => val.split(',').map(v => toInt(v)).filter(Boolean),
    };

    for (let [key, value] of Object.entries(fields)) {
      if (fieldParsers[key]) {
        value = fieldParsers[key](value);
      }
      keys.push(key);
      values.push(value);
    }

    // Handle image upload if files exist
    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
      keys.push('images');
      values.push(JSON.stringify(imagePaths));
    }

    if (keys.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    // Generate the SET clause dynamically
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const query = `UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`;

    const result = await pool.query(query, [...values, productId]);

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0],
    });
  } catch (err) {
    console.error('Update error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};



