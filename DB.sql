-- CREA DB
CREATE DATABASE trasferte_azienda;
USE trasferte_azienda;

-- Creazione tabelle
CREATE TABLE dipendenti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    ruolo VARCHAR(50) NOT NULL,
    dipartimento VARCHAR(50) NOT NULL
);

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    ruolo ENUM('amministratore', 'dipendente', 'manager') NOT NULL,
    password VARCHAR(255) NOT NULL,  -- La password dovrebbe essere salvata come hash (ad esempio con bcrypt)
    bloccato BOOLEAN DEFAULT FALSE,
    tentativi_accesso_rimasti INT DEFAULT 3,
    data_ultimo_cambio_password TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dipendente_id INT,  -- Riferimento al dipendente (opzionale)
    FOREIGN KEY (dipendente_id) REFERENCES dipendenti(id)  -- Collegamento opzionale con la tabella dipendenti
);

CREATE TABLE trasferte (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,  -- Responsabile principale della trasferta
    destinazione VARCHAR(100) NOT NULL,
    data_inizio DATE NOT NULL,
    data_fine DATE NOT NULL,
    cliente VARCHAR(100),
    spese_totali DECIMAL(10, 2),  -- Totale delle spese della trasferta
    FOREIGN KEY (id_user) REFERENCES dipendenti(id)
);

CREATE TABLE trasferte_utenti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_trasferta INT,
    id_user INT,
    FOREIGN KEY (id_trasferta) REFERENCES trasferte(id),
    FOREIGN KEY (id_user) REFERENCES dipendenti(id)
);

CREATE TABLE spesa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_trasferta INT,
    categoria_spesa VARCHAR(50) NOT NULL,
    fatta_da INT NOT NULL,  -- Dipendente che ha sostenuto la spesa
    quanto DECIMAL(10, 2) NOT NULL,
    quando DATE NOT NULL,
    motivazione TEXT,
    FOREIGN KEY (id_trasferta) REFERENCES trasferte(id),
    FOREIGN KEY (fatta_da) REFERENCES dipendenti(id)
);


-- Dati fasulli
INSERT INTO dipendenti (nome, cognome, email, ruolo, dipartimento)
VALUES
    ('Mario', 'Rossi', 'mario.rossi@azienda.com', 'Manager', 'Amministrazione'),
    ('Luca', 'Bianchi', 'luca.bianchi@azienda.com', 'Tecnico', 'Sistemi'),
    ('Giulia', 'Verdi', 'giulia.verdi@azienda.com', 'Impiegato', 'Marketing'),
    ('Anna', 'Neri', 'anna.neri@azienda.com', 'Direttore', 'Vendite'),
    ('Marco', 'Gialli', 'marco.gialli@azienda.com', 'Assistente', 'Contabilità');


INSERT INTO users (username, email, ruolo, password, bloccato, tentativi_accesso_rimasti, data_ultimo_cambio_password, dipendente_id)
VALUES
    ('admin123', 'admin@azienda.com', 'amministratore', 'password123', FALSE, 3, NOW(), NULL),
    ('emp001', 'mario.rossi@azienda.com', 'dipendente', 'password123', FALSE, 3, NOW(), 1),
    ('man001', 'luca.bianchi@azienda.com', 'manager', 'password123', FALSE, 3, NOW(), 2);


INSERT INTO trasferte (id_user, destinazione, data_inizio, data_fine, cliente, spese_totali)
VALUES
    (1, 'Milano', '2025-03-01', '2025-03-03', 'Cliente A', 450.00),
    (2, 'Roma', '2025-03-05', '2025-03-07', 'Cliente B', 320.50),
    (3, 'Napoli', '2025-03-10', '2025-03-12', 'Cliente C', 200.75),
    (4, 'Torino', '2025-03-15', '2025-03-17', 'Cliente D', 380.60),
    (5, 'Firenze', '2025-03-20', '2025-03-22', 'Cliente E', 500.00);


INSERT INTO trasferte_utenti (id_trasferta, id_user)
VALUES
    (1, 1),  -- Mario Rossi partecipa alla trasferta 1
    (1, 2),  -- Luca Bianchi partecipa alla trasferta 1
    (2, 3),  -- Giulia Verdi partecipa alla trasferta 2
    (2, 4),  -- Anna Neri partecipa alla trasferta 2
    (3, 3),  -- Giulia Verdi partecipa alla trasferta 3
    (4, 4),  -- Anna Neri partecipa alla trasferta 4
    (5, 5),  -- Marco Gialli partecipa alla trasferta 5
    (5, 2);  -- Luca Bianchi partecipa alla trasferta 5

INSERT INTO spesa (id_trasferta, categoria_spesa, fatta_da, quanto, quando, motivazione)
VALUES
    (1, 'Volo', 1, 150.00, '2025-03-01', 'Volo andata'),
    (1, 'Hotel', 1, 200.00, '2025-03-01', 'Hotel 2 notti'),
    (1, 'Ristorante', 1, 100.00, '2025-03-02', 'Cena di lavoro'),
    (1, 'Taxi', 2, 50.00, '2025-03-03', 'Taxi aeroporto'),
    (1, 'Vitto', 2, 50.00, '2025-03-01','Pranzo'),
    (2, 'Vitto', 3, 50.00, '2025-03-05', 'Cena'),
    (2, 'Taxi', 4, 30.50, '2025-03-06', 'Taxi hotel'),
    (3, 'Vitto', 3, 40.00, '2025-03-10','Pranzo'),
    (3, 'Hotel', 3, 60.75, '2025-03-10','Hotel 1 notte'),
    (4, 'Taxi', 4, 25.00, '2025-03-15','Taxi stazione'),
    (4, 'Vitto', 4, 55.60, '2025-03-16','Cena'),
    (5, 'Volo', 5, 180.00, '2025-03-20','Volo ritorno'),
    (5, 'Hotel', 2, 320.00, '2025-03-20', 'Hotel cliente');

/*

Esempio di Query per Visualizzare le Spese per una Trasferta Specifica:

Se vuoi vedere tutte le spese associate alla trasferta con id = 1, puoi fare una query come questa:

SELECT 
    s.categoria_spesa, 
    u.nome AS dipendente, 
    s.quantità, 
    s.quando
FROM 
    spesa s
JOIN 
    users u ON s.fatta_da = u.id
WHERE 
    s.id_trasferta = 1;

*/