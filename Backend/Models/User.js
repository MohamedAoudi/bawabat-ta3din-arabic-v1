const pool = require("../db");

// Get all users
const getAllUsers = async () => {
  const query = `
    SELECT id, 
           nom_ar, nom_en, nom_fr, 
           prenom_ar, prenom_en, prenom_fr, 
           email, password, role, photo, created_at 
    FROM users ORDER BY created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};

// Get user by ID
const getUserById = async (id) => {
  const query = `
    SELECT id, 
           nom_ar, nom_en, nom_fr, 
           prenom_ar, prenom_en, prenom_fr, 
           email, password, role, photo, created_at 
    FROM users WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Get user by email
const getUserByEmail = async (email) => {
  const query = `
    SELECT id, 
           nom_ar, nom_en, nom_fr, 
           prenom_ar, prenom_en, prenom_fr, 
           email, password, role, photo, created_at 
    FROM users WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// Create new user (trilingual: Arabic, English, French)
const createUser = async (user) => {
  const { nom_ar, nom_en, nom_fr, prenom_ar, prenom_en, prenom_fr, email, password, role, photo } = user;
  const query = `
    INSERT INTO users (nom_ar, nom_en, nom_fr, prenom_ar, prenom_en, prenom_fr, email, password, role, photo)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, nom_ar, nom_en, nom_fr, prenom_ar, prenom_en, prenom_fr, email, role, photo, created_at
  `;
  const result = await pool.query(query, [nom_ar, nom_en, nom_fr, prenom_ar, prenom_en, prenom_fr, email, password, role || 'user', photo || null]);
  return result.rows[0];
};

// Update user (trilingual)
const updateUser = async (id, user) => {
  const { nom_ar, nom_en, nom_fr, prenom_ar, prenom_en, prenom_fr, email, password, role, photo } = user;
  const query = `
    UPDATE users 
    SET nom_ar = COALESCE($1, nom_ar),
        nom_en = COALESCE($2, nom_en),
        nom_fr = COALESCE($3, nom_fr),
        prenom_ar = COALESCE($4, prenom_ar),
        prenom_en = COALESCE($5, prenom_en),
        prenom_fr = COALESCE($6, prenom_fr),
        email = COALESCE($7, email),
        password = COALESCE($8, password),
        role = COALESCE($9, role),
        photo = COALESCE($10, photo)
    WHERE id = $11
    RETURNING id, nom_ar, nom_en, nom_fr, prenom_ar, prenom_en, prenom_fr, email, role, photo, created_at
  `;
  const result = await pool.query(query, [nom_ar, nom_en, nom_fr, prenom_ar, prenom_en, prenom_fr, email, password, role, photo, id]);
  return result.rows[0];
};

// Delete user
const deleteUser = async (id) => {
  const query = "DELETE FROM users WHERE id = $1 RETURNING id";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
};