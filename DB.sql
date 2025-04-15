-- CREATE DATABASE opencom_pdm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE opencom_pdm;

CREATE TABLE dipartimenti (
    id_dipartimento INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE dipendenti (
    id_dipendente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL, -- per invito iscrizione
    id_dipartimento INT NOT NULL,
    ruolo ENUM('responsabile', 'dipendente', 'contabile', 'esterno') NOT NULL DEFAULT 'dipendente',
    FOREIGN KEY (id_dipartimento) REFERENCES dipartimenti(id_dipartimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE progetti (
    id_progetto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data_inizio DATE NOT NULL,
    data_fine DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categorie_spese (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE trasferte (
    id_trasferta INT AUTO_INCREMENT PRIMARY KEY,
    id_progetto INT NOT NULL,
    luogo VARCHAR(255) NOT NULL,
    data_inizio DATE NOT NULL,
    data_fine DATE NOT NULL,
    id_responsabile INT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    motivo_viaggio TEXT,
    note TEXT,
    FOREIGN KEY (id_responsabile) REFERENCES dipendenti(id_dipendente),
    FOREIGN KEY (id_progetto) REFERENCES progetti(id_progetto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella di associazione per i partecipanti alla trasferta
CREATE TABLE trasferta_partecipanti (
    id_trasferta INT NOT NULL,
    id_dipendente INT NOT NULL,
    PRIMARY KEY (id_trasferta, id_dipendente),
    FOREIGN KEY (id_trasferta) REFERENCES trasferte(id_trasferta),
    FOREIGN KEY (id_dipendente) REFERENCES dipendenti(id_dipendente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE spese (
    id_spesa INT AUTO_INCREMENT PRIMARY KEY,
    uuid_spesa CHAR(36) NOT NULL DEFAULT (UUID()),
    id_trasferta INT NOT NULL,
    id_categoria INT NOT NULL,
    id_dipendente INT NOT NULL,
    data_spesa DATE NOT NULL,
    descrizione VARCHAR(250) NOT NULL,
    importo DECIMAL(10,2) NOT NULL,
    scontrino_url VARCHAR(255),
    stato_approvazione ENUM('presentata', 'approvata', 'respinta') NOT NULL DEFAULT 'presentata',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (uuid_spesa),
    FOREIGN KEY (id_trasferta) REFERENCES trasferte(id_trasferta),
    FOREIGN KEY (id_dipendente) REFERENCES dipendenti(id_dipendente),
    FOREIGN KEY (id_categoria) REFERENCES categorie_spese(id_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE approvazioni (
    id_approvazione INT AUTO_INCREMENT PRIMARY KEY,
    id_spesa INT NOT NULL,
    id_responsabile INT NOT NULL,
    stato ENUM('approvata', 'respinta') NOT NULL,
    motivazione TEXT,
    data_approvazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_spesa) REFERENCES spese(id_spesa),
    FOREIGN KEY (id_responsabile) REFERENCES dipendenti(id_dipendente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indici per velocizzare le query
CREATE INDEX idx_spese_trasferta ON spese(id_trasferta);
CREATE INDEX idx_spese_dipendente ON spese(id_dipendente);
CREATE INDEX idx_trasferte_progetto ON trasferte(id_progetto);

-- Users per login
CREATE TABLE users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    id_dipendente INT NOT NULL UNIQUE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    ultimo_accesso DATETIME,
    reset_token VARCHAR(100),
    reset_token_expiry DATETIME,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    tentativi_accesso_rimasti INT NOT NULL DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_dipendente) REFERENCES dipendenti(id_dipendente),
    INDEX (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Creazione del trigger per verificare che il dipendente esista prima di inserire un user
DELIMITER //
CREATE TRIGGER before_insert_user
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    DECLARE emp_email VARCHAR(255);
    
    -- Controllo che il dipendente esista
    SELECT email INTO emp_email FROM dipendenti WHERE id_dipendente = NEW.id_dipendente;
    
    IF emp_email IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Errore: Il dipendente associato non esiste';
    END IF;
END;
//
DELIMITER ;

-- vista per gestire ruoli user/dipendente
CREATE VIEW user_details AS
SELECT 
    u.id_user, 
    d.id_dipendente,
    u.username, 
    d.email, 
    d.ruolo,
    u.is_admin, 
    u.is_active 
FROM users u
JOIN dipendenti d ON u.id_dipendente = d.id_dipendente;