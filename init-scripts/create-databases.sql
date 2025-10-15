-- Crearea bazei de date principale, pentru dev și prod
CREATE DATABASE IF NOT EXISTS `recipe_db`;
GRANT ALL PRIVILEGES ON `recipe_db`.* TO 'admin';
