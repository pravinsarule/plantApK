// const pool = require("../config/db");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const { generateOTP, sendOTP } = require("../services/emailService");

// // Vendor Login with Email & Password (First-time Login flow)
// const login = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: "Email and password are required" });
//   }

//   try {
//     const vendorResult = await pool.query(
//       "SELECT * FROM vendors WHERE email = $1",
//       [email]
//     );
//     const vendor = vendorResult.rows[0];

//     if (!vendor) {
//       return res.status(404).json({
//         status: "not_found",
//         message: "Vendor not found",
//         email,
//       });
//     }

//     // If it's the vendor's first-time login, send OTP and prompt for password update
//     if (!vendor.password_changed) {
//       const otp = generateOTP();
//       const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

//       // Insert or update OTP for login verification
//       await pool.query(
//         `
//         INSERT INTO otps (user_id, user_type, otp, expires_at) 
//         VALUES ($1, $2, $3, $4)
//         ON CONFLICT (user_id, user_type) 
//         DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at
//         `,
//         [vendor.id, "vendor", otp, expiresAt]
//       );

//       // Send OTP to vendor's email
//       await sendOTP(vendor.email, otp, "email");

//       return res.json({
//         status: "otp_sent",
//         message: "OTP sent to your email. Please verify to login and set your password.",
//       });
//     }

//     // If the vendor already updated their password, validate the password
//     const validPassword = await bcrypt.compare(password, vendor.password);
//     if (!validPassword) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }

//     // Generate OTP for subsequent login
//     const otp = generateOTP();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

//     // Insert or update OTP for login verification
//     await pool.query(
//       `
//       INSERT INTO otps (user_id, user_type, otp, expires_at) 
//       VALUES ($1, $2, $3, $4)
//       ON CONFLICT (user_id, user_type) 
//       DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at
//       `,
//       [vendor.id, "vendor", otp, expiresAt]
//     );

//     // Send OTP to vendor's email
//     await sendOTP(vendor.email, otp, "email");

//     return res.json({
//       status: "otp_sent",
//       message: "OTP sent to your email. Please verify to login.",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Verify OTP and Proceed to Password Update (First-time login flow)
// const verifyOTP = async (req, res) => {
//   const { email, otp, newPassword } = req.body;

//   if (!otp || !email) {
//     return res.status(400).json({ error: "OTP and email are required" });
//   }

//   try {
//     const vendorResult = await pool.query(
//       "SELECT * FROM vendors WHERE email = $1",
//       [email]
//     );
//     const vendor = vendorResult.rows[0];

//     if (!vendor) return res.status(404).json({ error: "Vendor not found" });

//     // Verify the OTP
//     const otpResult = await pool.query(
//       "SELECT * FROM otps WHERE user_id = $1 AND user_type = 'vendor' AND otp = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
//       [vendor.id, otp]
//     );
//     const otpRecord = otpResult.rows[0];

//     if (!otpRecord) {
//       return res.status(400).json({ error: "Invalid or expired OTP" });
//     }

//     await pool.query("DELETE FROM otps WHERE id = $1", [otpRecord.id]); // Remove used OTP

//     // If it's the vendor's first-time login, prompt to update password
//     if (!vendor.password_changed) {
//       if (!newPassword) {
//         return res.status(400).json({ error: "Please provide a new password" });
//       }

//       // Hash the new password and update it in the database
//       const hashedPassword = await bcrypt.hash(newPassword, 10);

//       // Update password in the vendors table and set password_changed = true
//       await pool.query(
//         "UPDATE vendors SET password = $1, password_changed = true WHERE id = $2",
//         [hashedPassword, vendor.id]
//       );

//       // Generate JWT Token after password update
//       const sessionId = jwt.sign(
//         { id: vendor.id, email: vendor.email, phone: vendor.phone, name: vendor.name },
//         process.env.JWT_SECRET,
//         { expiresIn: "1h" }
//       );

//       return res.json({
//         status: "password_changed",
//         message: "Password updated successfully. You can now access your dashboard.",
//         session_id: sessionId,
//       });
//     }

//     // If the vendor already has a password and has updated it, allow access to the dashboard
//     const sessionId = jwt.sign(
//       { id: vendor.id, email: vendor.email, phone: vendor.phone, name: vendor.name },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.json({
//       status: "logged_in",
//       message: "Logged in successfully. You can now access your dashboard.",
//       session_id: sessionId,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Vendor Logout
// const logout = async (req, res) => {
//   res.json({ status: "success", message: "Logged out successfully" });
// };

// module.exports = { login, verifyOTP, logout };

// const pool = require("../config/db");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const { generateOTP, sendOTP } = require("../services/emailService");

// // Vendor Login with Email & Password
// const login = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: "Email and password are required" });
//   }

//   try {
//     const result = await pool.query("SELECT * FROM vendor_profiles WHERE email = $1", [email]);
//     const vendor = result.rows[0];

//     if (!vendor) {
//       return res.status(404).json({
//         status: "not_found",
//         message: "Vendor not found",
//         email,
//       });
//     }

//     // First-time login flow
//     if (!vendor.password_changed) {
//       const otp = generateOTP();
//       const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//       await pool.query(
//         `INSERT INTO otps (user_id, user_type, otp, expires_at)
//          VALUES ($1, $2, $3, $4)
//          ON CONFLICT (user_id, user_type) DO UPDATE
//          SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
//         [vendor.id, "vendor", otp, expiresAt]
//       );

//       await sendOTP(vendor.email, otp, "email");

//       return res.json({
//         status: "otp_sent",
//         message: "OTP sent. Please verify to continue and set your password.",
//       });
//     }

//     // Regular login flow
//     const validPassword = await bcrypt.compare(password, vendor.password);
//     if (!validPassword) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }

//     const otp = generateOTP();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//     await pool.query(
//       `INSERT INTO otps (user_id, user_type, otp, expires_at)
//        VALUES ($1, $2, $3, $4)
//        ON CONFLICT (user_id, user_type) DO UPDATE
//        SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
//       [vendor.id, "vendor", otp, expiresAt]
//     );

//     await sendOTP(vendor.email, otp, "email");

//     return res.json({
//       status: "otp_sent",
//       message: "OTP sent to your email. Please verify to login.",
//     });

//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // OTP Verification and First-time Password Update
// const verifyOTP = async (req, res) => {
//   const { email, otp, newPassword } = req.body;

//   if (!otp || !email) {
//     return res.status(400).json({ error: "OTP and email are required" });
//   }

//   try {
//     const vendorResult = await pool.query("SELECT * FROM vendor_profiles WHERE email = $1", [email]);
//     const vendor = vendorResult.rows[0];

//     if (!vendor) return res.status(404).json({ error: "Vendor not found" });

//     const otpResult = await pool.query(
//       `SELECT * FROM otps
//        WHERE user_id = $1 AND user_type = 'vendor' AND otp = $2 AND expires_at > NOW()
//        ORDER BY created_at DESC LIMIT 1`,
//       [vendor.id, otp]
//     );

//     const otpRecord = otpResult.rows[0];
//     if (!otpRecord) return res.status(400).json({ error: "Invalid or expired OTP" });

//     await pool.query("DELETE FROM otps WHERE id = $1", [otpRecord.id]);

//     if (!vendor.password_changed) {
//       if (!newPassword) return res.status(400).json({ error: "New password required" });

//       const hashedPassword = await bcrypt.hash(newPassword, 10);

//       await pool.query(
//         `UPDATE vendor_profiles SET password = $1, password_changed = true WHERE id = $2`,
//         [hashedPassword, vendor.id]
//       );
//     }

//     const sessionId = jwt.sign(
//       {
//         id: vendor.id,
//         email: vendor.email,
//         name: vendor.name,
//         role: vendor.role, // role-based
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     return res.json({
//       status: "logged_in",
//       message: vendor.password_changed
//         ? "Logged in successfully"
//         : "Password set and logged in successfully",
//       session_id: sessionId,
//     });
//   } catch (error) {
//     console.error("OTP Verification Error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Vendor Logout
// const logout = async (req, res) => {
//   res.json({ status: "success", message: "Logged out successfully" });
// };

// module.exports = { login, verifyOTP, logout };



// const pool = require("../config/db");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const { generateOTP, sendOTP } = require("../services/emailService");

// // Helper function: find user by email from multiple tables and return user + userType
// async function findUserByEmail(email) {
//   // Check vendor_profiles table
//   let res = await pool.query("SELECT * FROM vendor_profiles WHERE email = $1", [email]);
//   if (res.rows.length > 0) {
//     return { user: res.rows[0], userType: "vendor" };
//   }
//   // Check company_profiles table
//   res = await pool.query("SELECT * FROM vendor_profiles WHERE email = $1", [email]);
//   if (res.rows.length > 0) {
//     return { user: res.rows[0], userType: "company" };
//   }
//   return null; // user not found
// }

// const login = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password)
//     return res.status(400).json({ error: "Email and password are required" });

//   try {
//     const found = await findUserByEmail(email);
//     if (!found) {
//       return res.status(404).json({ status: "not_found", message: "User not found", email });
//     }

//     const { user, userType } = found;

//     // First-time login flow (password not set)
//     if (!user.password_changed) {
//       const otp = generateOTP();
//       const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//       await pool.query(
//         `INSERT INTO otps (user_id, user_type, otp, expires_at)
//          VALUES ($1, $2, $3, $4)
//          ON CONFLICT (user_id, user_type) DO UPDATE
//          SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
//         [user.id, userType, otp, expiresAt]
//       );

//       await sendOTP(user.email, otp, "email");

//       return res.json({
//         status: "otp_sent",
//         message: "OTP sent. Please verify to continue and set your password.",
//       });
//     }

//     // Regular login flow - verify password
//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }

//     const otp = generateOTP();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//     await pool.query(
//       `INSERT INTO otps (user_id, user_type, otp, expires_at)
//        VALUES ($1, $2, $3, $4)
//        ON CONFLICT (user_id, user_type) DO UPDATE
//        SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
//       [user.id, userType, otp, expiresAt]
//     );

//     await sendOTP(user.email, otp, "email");

//     return res.json({
//       status: "otp_sent",
//       message: "OTP sent to your email. Please verify to login.",
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     return res.status(500).json({ error: "Server error" });
//   }
// };

// const verifyOTP = async (req, res) => {
//   const { email, otp, newPassword } = req.body;

//   if (!email || !otp) {
//     return res.status(400).json({ error: "Email and OTP are required" });
//   }

//   try {
//     const found = await findUserByEmail(email);
//     if (!found) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const { user, userType } = found;

//     // Check OTP for this user and type
//     const otpResult = await pool.query(
//       `SELECT * FROM otps
//        WHERE user_id = $1 AND user_type = $2 AND otp = $3 AND expires_at > NOW()
//        ORDER BY created_at DESC LIMIT 1`,
//       [user.id, userType, otp]
//     );

//     const otpRecord = otpResult.rows[0];
//     if (!otpRecord) {
//       return res.status(400).json({ error: "Invalid or expired OTP" });
//     }

//     // Delete OTP after verification
//     await pool.query("DELETE FROM otps WHERE id = $1", [otpRecord.id]);

//     // If first time login and password not set, require new password
//     if (!user.password_changed) {
//       if (!newPassword) {
//         return res.status(400).json({ error: "New password is required" });
//       }

//       const hashedPassword = await bcrypt.hash(newPassword, 10);

//      const tableName = userType === "vendor" ? "vendor_profiles" : "company";

//       await pool.query(
//         `UPDATE ${tableName} SET password = $1, password_changed = true WHERE id = $2`,
//         [hashedPassword, user.id]
//       );
//     }

//     // Generate JWT token with role info
//     const sessionId = jwt.sign(
//       {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         role: userType,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     return res.json({
//       status: "logged_in",
//       message: user.password_changed
//         ? "Logged in successfully"
//         : "Password set and logged in successfully",
//       session_id: sessionId,
//     });
//   } catch (error) {
//     console.error("OTP Verification Error:", error);
//     return res.status(500).json({ error: "Server error" });
//   }
// };

// const logout = async (req, res) => {
//   res.json({ status: "success", message: "Logged out successfully" });
// };

// module.exports = { login, verifyOTP, logout };



// controllers/authController.js
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { generateOTP, sendOTP } = require("../services/emailService");

// Step 1: Login with Email + Password
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate request body
  if (!email || !password) {
    return res.status(400).json({ 
      error: "Email and password are required",
      status: "error"
    });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: "Invalid email format",
      status: "error"
    });
  }

  try {
    // Find user from vendor_profiles (supports both vendor and company roles)
    const result = await pool.query(
      "SELECT id, name, email, password, password_changed, role FROM vendor_profiles WHERE email = $1 AND role IN ('vendor', 'company')",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: "User not found or invalid role",
        status: "error"
      });
    }

    const user = result.rows[0];

    // Check password if password_changed is true (subsequent logins)
    if (user.password_changed) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ 
          error: "Invalid password",
          status: "error"
        });
      }
    } else {
      // For first-time login, we don't verify the password here
      // The temporary password will be replaced during OTP verification
      console.log(`First-time login attempt for user: ${email}, role: ${user.role}`);
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Store OTP in the database with proper user identification
    await pool.query(
      `INSERT INTO otps (user_id, user_type, otp, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, user_type) DO UPDATE
       SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at, created_at = NOW()`,
      [user.id, user.role, otp, expiresAt]
    );

    // Send OTP to email
    await sendOTP(user.email, otp, "email");

    // Return response with password_changed status for frontend handling
    return res.status(200).json({
      status: "otp_sent",
      password_changed: user.password_changed, // Key field for frontend first-time detection
      role: user.role, // Include role information
      message: user.password_changed
        ? "OTP sent to your email for verification."
        : "First-time login: OTP sent to your email. You will need to set a new password.",
      user_id: user.id, // For debugging purposes
      email: user.email
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ 
      error: "Server error during login",
      status: "error"
    });
  }
};

// Step 2: Verify OTP and Complete Authentication
const verifyOTP = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Validate request body
  if (!email || !otp) {
    return res.status(400).json({ 
      error: "Email and OTP are required",
      status: "error"
    });
  }

  // Validate OTP format (6 digits)
  const otpRegex = /^\d{6}$/;
  if (!otpRegex.test(otp)) {
    return res.status(400).json({ 
      error: "OTP must be a 6-digit number",
      status: "error"
    });
  }

  try {
    // Find user with role validation
    const userResult = await pool.query(
      "SELECT id, name, email, password, password_changed, role FROM vendor_profiles WHERE email = $1 AND role IN ('vendor', 'company')",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        error: "User not found or invalid role",
        status: "error"
      });
    }

    const user = userResult.rows[0];

    // Find and verify the latest valid OTP
    const otpResult = await pool.query(
      `SELECT * FROM otps
       WHERE user_id = $1 AND user_type = $2 AND otp = $3 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [user.id, user.role, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ 
        error: "Invalid or expired OTP",
        status: "error"
      });
    }

    // OTP is valid: delete it from the database to prevent reuse
    await pool.query("DELETE FROM otps WHERE id = $1", [otpResult.rows[0].id]);

    let responseStatus = "logged_in";
    let responseMessage = "Login successful";

    // Handle first-time login: set new password
    if (!user.password_changed) {
      if (!newPassword) {
        return res.status(400).json({ 
          error: "New password required for first-time login",
          status: "error"
        });
      }

      // Validate new password strength
      if (newPassword.length < 8) {
        return res.status(400).json({ 
          error: "New password must be at least 8 characters long",
          status: "error"
        });
      }

      // Enhanced password validation (optional - you can adjust requirements)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          error: "New password must contain at least one uppercase letter, one lowercase letter, and one number",
          status: "error"
        });
      }

      try {
        // Hash and update the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12); // Increased salt rounds for better security
        
        // Update password and set password_changed to true
        await pool.query(
          `UPDATE vendor_profiles SET password = $1, password_changed = true, updated_at = NOW() WHERE id = $2`,
          [hashedPassword, user.id]
        );

        responseStatus = "password_changed";
        responseMessage = "Password set successfully, login complete";

        console.log(`Password successfully changed for user: ${email}, role: ${user.role}`);

      } catch (hashError) {
        console.error("Password hashing error:", hashError);
        return res.status(500).json({ 
          error: "Error setting new password",
          status: "error"
        });
      }
    }

    // Generate JWT with comprehensive user info
    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      password_changed: true, // Always true after successful verification
      iat: Math.floor(Date.now() / 1000), // Issued at
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production",
      { 
        expiresIn: "7d", // Extended session for better UX
        algorithm: 'HS256'
      }
    );

    // Log successful authentication for security monitoring
    console.log(`Successful authentication: ${email}, role: ${user.role}, status: ${responseStatus}`);

    // Return comprehensive response for frontend role-based navigation
    return res.status(200).json({
      status: responseStatus, // "logged_in" or "password_changed"
      message: responseMessage,
      session_id: token, // JWT token for authentication
      token: token, // Alternative token field for compatibility
      role: user.role, // "vendor" or "company" for navigation
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        password_changed: true
      },
      // Navigation hints for frontend
      dashboard_url: user.role === "vendor" ? "/vendor/dashboard" : 
                    user.role === "company" ? "/company/dashboard" : "/dashboard"
    });

  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({ 
      error: "Server error during OTP verification",
      status: "error"
    });
  }
};

// Step 3: Logout with token blacklisting (optional enhancement)
const logout = async (req, res) => {
  try {
    // Extract token from request headers
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Optional: Add token to blacklist table for enhanced security
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production");
        
        // Optional: Store blacklisted token (create blacklisted_tokens table if needed)
        /*
        await pool.query(
          `INSERT INTO blacklisted_tokens (token, user_id, expires_at) 
           VALUES ($1, $2, $3)
           ON CONFLICT (token) DO NOTHING`,
          [token, decoded.id, new Date(decoded.exp * 1000)]
        );
        */

        console.log(`User logged out: ${decoded.email}, role: ${decoded.role}`);
      } catch (tokenError) {
        // Token might be invalid, but we still proceed with logout
        console.log("Logout with invalid/expired token");
      }
    }

    return res.status(200).json({ 
      status: "success", 
      message: "Logged out successfully" 
    });

  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ 
      error: "Server error during logout",
      status: "error"
    });
  }
};

// Helper function to verify JWT token (for protected routes)
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: "Access token required",
        status: "unauthorized"
      });
    }

    const token = authHeader.substring(7);
    
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production");
    
    // Optional: Check if token is blacklisted
    /*
    const blacklistedResult = await pool.query(
      "SELECT id FROM blacklisted_tokens WHERE token = $1 AND expires_at > NOW()",
      [token]
    );
    
    if (blacklistedResult.rows.length > 0) {
      return res.status(401).json({ 
        error: "Token has been revoked",
        status: "unauthorized"
      });
    }
    */

    // Verify user still exists and has valid role
    const userResult = await pool.query(
      "SELECT id, name, email, role, password_changed FROM vendor_profiles WHERE id = $1 AND role IN ('vendor', 'company')",
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        error: "User not found or invalid role",
        status: "unauthorized"
      });
    }

    // Add user info to request object
    req.user = {
      ...decoded,
      ...userResult.rows[0]
    };

    next();

  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ 
      error: "Invalid or expired token",
      status: "unauthorized"
    });
  }
};

// Get current user info (protected route)
const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    
    return res.status(200).json({
      status: "success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        password_changed: user.password_changed
      },
      dashboard_url: user.role === "vendor" ? "/dashboard" : 
                    user.role === "company" ? "/company/dashboard" : "/dashboard"
    });

  } catch (err) {
    console.error("Get current user error:", err);
    return res.status(500).json({ 
      error: "Server error getting user info",
      status: "error"
    });
  }
};

module.exports = { 
  login, 
  verifyOTP, 
  logout, 
  verifyToken, 
  getCurrentUser 
};