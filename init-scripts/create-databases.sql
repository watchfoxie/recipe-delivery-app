-- Crearea bazei de date principale, pentru dev și prod
CREATE DATABASE IF NOT EXISTS `recipe_db`;
GRANT ALL PRIVILEGES ON `recipe_db`.* TO 'admin';

-- Crearea bazei de date auxiliare, pentru testare
CREATE DATABASE IF NOT EXISTS `recipe_db_test`;
GRANT ALL PRIVILEGES ON `recipe_db_test`.* TO 'admin';
