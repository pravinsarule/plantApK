// controllers/subcategoriesController.js
const pool = require('../config/db.config');



exports.requestSubCategory = async (req, res) => {
  const { category_id, name_en, slug, description } = req.body;
  const vendor_id = req.user.id;

  try {
    // Ensure the category exists
    const categoryCheck = await pool.query(
      `SELECT id FROM categories WHERE id = $1 AND is_active = true`,
      [category_id]
    );

    if (categoryCheck.rowCount === 0) {
      return res.status(400).json({ message: 'Invalid or inactive category_id' });
    }

    // Insert subcategory request
    const result = await pool.query(
      `INSERT INTO sub_categories (
        category_id, name_en, slug, description,
        is_active, created_at, vendor_id, approved_by_admin
      ) VALUES ($1, $2, $3, $4, false, NOW(), $5, false)
      RETURNING *`,
      [category_id, name_en, slug, description, vendor_id]
    );

    res.status(201).json({
      message: 'Request sent to admin',
      subcategory: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error adding subcategory',
      error: err.message,
    });
  }
};


exports.getApproved = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM sub_categories WHERE is_active = true AND approved_by_admin = true`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching subcategories',
      error: err.message,
    });
  }
};





exports.getPendingApprovals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM sub_categories WHERE approved_by_admin = false`
    );

    res.status(200).json({
      message: 'Pending approval subcategories fetched successfully',
      subcategories: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching pending approvals',
      error: err.message,
    });
  }
};
