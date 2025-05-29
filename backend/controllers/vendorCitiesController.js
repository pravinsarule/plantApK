

// const pool = require('../config/db.config');

// // Create or assign a city to a vendor by full city details (auto-create city if not exists)
// exports.assignCityToVendor = async (req, res) => {
//   const { vendor_id, country, state, city } = req.body;

//   if (!vendor_id || !country || !state || !city) {
//     return res.status(400).json({ message: 'vendor_id, country, state, and city are required.' });
//   }

//   try {
//     // Check if city exists (case-insensitive for all text fields)
//     let cityResult = await pool.query(
//       `SELECT id FROM cities 
//        WHERE LOWER(TRIM(country)) = LOWER(TRIM($1)) 
//          AND LOWER(TRIM(state)) = LOWER(TRIM($2))
//          AND LOWER(TRIM(city)) = LOWER(TRIM($3))`,
//       [country, state, city]
//     );

//     let city_id;

//     // If city doesn't exist, insert it
//     if (cityResult.rows.length === 0) {
//       const insertCity = await pool.query(
//         `INSERT INTO cities (country, state, city) 
//          VALUES ($1, $2, $3) RETURNING id`,
//         [country.trim(), state.trim(), city.trim()]
//       );
//       city_id = insertCity.rows[0].id;
//     } else {
//       city_id = cityResult.rows[0].id;
//     }

//     // Check if city already assigned to vendor
//     const exists = await pool.query(
//       'SELECT * FROM vendor_cities WHERE vendor_id = $1 AND city_id = $2',
//       [vendor_id, city_id]
//     );

//     if (exists.rows.length > 0) {
//       return res.status(400).json({ message: 'City already assigned to this vendor.' });
//     }

//     // Assign city to vendor
//     const result = await pool.query(
//       'INSERT INTO vendor_cities (vendor_id, city_id) VALUES ($1, $2) RETURNING *',
//       [vendor_id, city_id]
//     );

//     res.status(201).json({
//       message: 'City created (if needed) and assigned to vendor successfully.',
//       data: result.rows[0],
//     });
//   } catch (error) {
//     console.error('Error assigning city to vendor:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // Get all cities assigned to a vendor
// exports.getVendorCities = async (req, res) => {
//   const { vendor_id } = req.params;

//   try {
//     const result = await pool.query(
//       `SELECT c.id, c.country, c.state, c.city 
//        FROM cities c
//        JOIN vendor_cities vc ON c.id = vc.city_id
//        WHERE vc.vendor_id = $1`,
//       [vendor_id]
//     );

//     res.status(200).json({ cities: result.rows });
//   } catch (error) {
//     console.error('Error fetching vendor cities:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // Get all cities (optionally with pagination)
// exports.getAllCities = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM cities ORDER BY country, state, city');
//     res.status(200).json({ cities: result.rows });
//   } catch (error) {
//     console.error('Error fetching cities:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // Update a city by id
// exports.updateCity = async (req, res) => {
//   const { id } = req.params;
//   const { country, state, city } = req.body;

//   if (!country && !state && !city) {
//     return res.status(400).json({ message: 'At least one field (country, state, or city) must be provided for update.' });
//   }

//   try {
//     // Fetch existing city by id to get current values
//     const existingCityResult = await pool.query(
//       'SELECT * FROM cities WHERE id = $1',
//       [id]
//     );

//     if (existingCityResult.rows.length === 0) {
//       return res.status(404).json({ message: 'City not found.' });
//     }

//     const existingCity = existingCityResult.rows[0];

//     // Use new values if provided, else keep existing ones
//     const newCountry = (country !== undefined) ? country.trim() : existingCity.country;
//     const newState = (state !== undefined) ? state.trim() : existingCity.state;
//     const newCity = (city !== undefined) ? city.trim() : existingCity.city;

//     // Check if the updated combination conflicts with another city (exclude current city id)
//     const conflictCheck = await pool.query(
//       `SELECT id FROM cities 
//        WHERE LOWER(TRIM(country)) = LOWER(TRIM($1)) 
//          AND LOWER(TRIM(state)) = LOWER(TRIM($2))
//          AND LOWER(TRIM(city)) = LOWER(TRIM($3))
//          AND id != $4`,
//       [newCountry, newState, newCity, id]
//     );

//     if (conflictCheck.rows.length > 0) {
//       return res.status(409).json({ message: 'Another city with this country, state, and city already exists.' });
//     }

//     // Perform the update
//     const updateResult = await pool.query(
//       `UPDATE cities SET country = $1, state = $2, city = $3
//        WHERE id = $4 RETURNING *`,
//       [newCountry, newState, newCity, id]
//     );

//     res.status(200).json({ message: 'City updated successfully.', city: updateResult.rows[0] });

//   } catch (error) {
//     console.error('Error updating city:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // Only remove a city assignment from a vendor (do not delete city)
// exports.removeCityFromVendor = async (req, res) => {
//   const { vendor_id, city_id } = req.body;

//   if (!vendor_id || !city_id) {
//     return res.status(400).json({ message: 'vendor_id and city_id are required.' });
//   }

//   try {
//     // Delete the vendor-city relation
//     const result = await pool.query(
//       'DELETE FROM vendor_cities WHERE vendor_id = $1 AND city_id = $2 RETURNING *',
//       [vendor_id, city_id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'No such city assignment found for this vendor.' });
//     }

//     res.status(200).json({ message: 'City assignment removed from vendor.', data: result.rows[0] });
//   } catch (error) {
//     console.error('Error removing city from vendor:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
