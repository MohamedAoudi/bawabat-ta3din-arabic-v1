-- SQL script to create users table (Trilingual: Arabic, English, French)
-- Table for storing user information in 3 languages

-- Drop old table if exists (for fresh install)
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  
  -- Nom / Name / الاسم
  nom_ar VARCHAR(100),                 -- Nom en arabe
  nom_en VARCHAR(100),                 -- Nom en anglais
  nom_fr VARCHAR(100),                 -- Nom en français
  
  -- Prénom / First Name / الاسم الأول
  prenom_ar VARCHAR(100),              -- Prénom en arabe
  prenom_en VARCHAR(100),              -- Prénom en anglais
  prenom_fr VARCHAR(100),              -- Prénom en français
  
  -- Email / Email / البريد الإلكتروني
  email VARCHAR(255) NOT NULL UNIQUE,
  
  -- Password / Mot de passe / كلمة المرور
  password VARCHAR(255) NOT NULL,
  
  -- Role / Rôle / الدور
  role VARCHAR(50) DEFAULT 'user',
  
  -- Photo / Photo / الصورة
  photo VARCHAR(500),
  
  -- Status / Statut / الحالة
  -- false = pending admin approval, true = accepted
  is_accepted BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

