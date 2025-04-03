-- Inserimento dipartimenti
INSERT INTO dipartimenti (nome) VALUES 
('Amministrazione'),
('ICT'),
('Progettazione'),
('Mobilità'),
('Direzione'),
('Altro');

-- Inserimento dipendenti
INSERT INTO dipendenti (nome, cognome, email, ruolo, id_dipartimento) VALUES
('Fabio', 'Frangipani', 'fabio.frangipani@opencom-italy.org', 'responsabile', 5),
('Niccolò', 'Agnoletti', 'web@opencom-italy.org', 'esterno', 2),
('Nicholas', 'Misto', 'nicholas.misto@opencom-italy.org', 'dipendente', 2),
('Daniele', 'Gelli', 'daniele.gelli@opencom-italy.org','responsabile', 2),
('Stefano', 'Marini', 'stefano.marini@opencom-italy.org', 'contabile', 1),
('Federica', 'Russo', 'federica.russo@opencom-italy.org','dipendente', 3),
('Paolo', 'Esposito', 'paolo.esposito@opencom-italy.org','dipendente', 4),
('Giulia', 'Conti', 'giulia.conti@gmail.com', 'esterno', 6);

-- Inserimento progetti
INSERT INTO progetti (nome, data_inizio, data_fine) VALUES
('Shuttle Magenta', '2025-08-23', '2028-04-15'),
('Green Energy Initiative', '2025-05-10', '2026-12-20'),
('Digital Transformation', '2025-02-15', '2026-06-30'),
('Product Launch 2025', '2025-09-01', '2026-03-15');

-- Inserimento categorie spese
INSERT INTO categorie_spese (nome) VALUES
('Alloggio'),
('Trasporto'),
('Pasti'),
('Materiali'),
('Intrattenimento clienti'),
('Taxi e spostamenti locali'),
('Voli'),
('Treni');

-- Inserimento trasferte
INSERT INTO trasferte (id_progetto, luogo, data_inizio, data_fine, id_responsabile, budget, motivo_viaggio, note) VALUES
(1, 'Milano', '2025-09-10', '2025-09-15', 1, 2500.00, 'Incontro iniziale con stakeholder', 'Prenotare hotel vicino alla stazione centrale'),
(1, 'Roma', '2025-10-20', '2025-10-25', 1, 3000.00, 'Presentazione prototipo', 'Portare tutto il materiale di presentazione'),
(1, 'Torino', '2025-11-05', '2025-11-10', 4, 2200.00, 'Ricerca fornitori', 'Fissare appuntamenti con almeno 3 fornitori'),
(2, 'Firenze', '2025-06-15', '2025-06-18', 4, 1800.00, 'Workshop sostenibilità', 'Prenotare sala conferenze per 20 persone'),
(2, 'Bologna', '2025-07-22', '2025-07-25', 1, 1500.00, 'Incontro con partner', 'Conferma appuntamento una settimana prima');

-- Inserimento partecipanti alle trasferte
INSERT INTO trasferta_partecipanti (id_trasferta, id_dipendente) VALUES
(1, 1), -- Fabio a Milano
(1, 2), -- Niccolò a Milano
(1, 3), -- Nicholas a Milano
(2, 1), -- Fabio a Roma
(2, 6), -- Federica Russo a Roma
(3, 4), -- Daniele a Torino
(3, 7), -- Paolo Esposito a Torino
(4, 4), -- Daniele a Firenze
(4, 2), -- Niccolò a Firenze
(5, 1), -- Fabio a Bologna
(5, 3); -- Nicholas a Bologna

-- Inserimento spese
INSERT INTO spese (uuid_spesa, id_trasferta, id_categoria, id_dipendente, data_spesa, descrizione, importo, scontrino_url, stato_approvazione, is_deleted) VALUES
-- Trasferta 1 - Milano
(UUID(), 1, 1, 1, '2025-09-10', 'Hotel Excelsior - 3 notti', 750.00, 'receipts/hotel_excelsior_20250910.jpg', 'approvata', FALSE),
(UUID(), 1, 2, 1, '2025-09-10', 'Volo andata A/R Milano', 320.00, 'receipts/flight_milan_20250910.pdf', 'approvata', FALSE),
(UUID(), 1, 3, 1, '2025-09-11', 'Cena con team', 145.80, 'receipts/dinner_team_20250911.jpg', 'approvata', FALSE),
(UUID(), 1, 6, 2, '2025-09-12', 'Taxi aeroporto-hotel', 65.00, 'receipts/taxi_20250912.jpg', 'approvata', FALSE),
(UUID(), 1, 3, 3, '2025-09-13', 'Pranzo di lavoro', 92.50, 'receipts/lunch_20250913.jpg', 'approvata', FALSE),
(UUID(), 1, 6, 2, '2025-09-15', 'Taxi hotel-aeroporto', 68.00, 'receipts/taxi_return_20250915.jpg', 'respinta', FALSE),
(UUID(), 1, 4, 3, '2025-09-14', 'Materiali per presentazione', 42.30, 'receipts/materials_20250914.jpg', 'presentata', FALSE),

-- Trasferta 2 - Roma
(UUID(), 2, 1, 1, '2025-10-20', 'Grand Hotel Roma - 5 notti', 1200.00, 'receipts/grandhotel_20251020.pdf', 'approvata', FALSE),
(UUID(), 2, 7, 1, '2025-10-20', 'Volo Roma A/R', 280.00, 'receipts/flight_rome_20251020.pdf', 'approvata', FALSE),
(UUID(), 2, 3, 6, '2025-10-21', 'Cena con cliente', 186.50, 'receipts/client_dinner_20251021.jpg', 'presentata', FALSE),
(UUID(), 2, 6, 6, '2025-10-22', 'Taxi per spostamenti vari', 120.00, NULL, 'presentata', FALSE),
(UUID(), 2, 5, 1, '2025-10-23', 'Intrattenimento clienti', 350.00, 'receipts/entertainment_20251023.pdf', 'respinta', FALSE),

-- Trasferta 3 - Torino
(UUID(), 3, 1, 4, '2025-11-05', 'Hotel Torino Centro - 5 notti', 950.00, 'receipts/hotel_torino_20251105.pdf', 'approvata', FALSE),
(UUID(), 3, 8, 7, '2025-11-05', 'Biglietti treno A/R', 150.00, 'receipts/train_torino_20251105.pdf', 'approvata', FALSE),
(UUID(), 3, 3, 4, '2025-11-06', 'Pranzo con fornitore', 125.40, 'receipts/lunch_supplier_20251106.jpg', 'approvata', FALSE),
(UUID(), 3, 6, 7, '2025-11-07', 'Taxi per visita impianti', 95.00, 'receipts/taxi_plant_20251107.jpg', 'presentata', FALSE),

-- Trasferta 4 - Firenze
(UUID(), 4, 1, 4, '2025-06-15', 'Hotel Firenze Centro', 480.00, 'receipts/hotel_firenze_20250615.pdf', 'approvata', FALSE),
(UUID(), 4, 2, 2, '2025-06-15', 'Treno A/R Firenze', 135.00, 'receipts/train_firenze_20250615.pdf', 'approvata', FALSE),
(UUID(), 4, 4, 4, '2025-06-16', 'Materiali workshop', 320.50, 'receipts/workshop_materials_20250616.jpg', 'presentata', FALSE),

-- Trasferta 5 - Bologna
(UUID(), 5, 1, 1, '2025-07-22', 'Hotel Bologna Business', 420.00, 'receipts/hotel_bologna_20250722.pdf', 'approvata', FALSE),
(UUID(), 5, 8, 3, '2025-07-22', 'Biglietti treno A/R', 110.00, 'receipts/train_bologna_20250722.pdf', 'presentata', FALSE),
(UUID(), 5, 3, 1, '2025-07-23', 'Cena con partner', 165.00, 'receipts/partner_dinner_20250723.jpg', 'presentata', FALSE),
(UUID(), 5, 6, 3, '2025-07-24', 'Taxi stazione-ufficio partner', 45.00, NULL, 'presentata', FALSE);

-- Inserimento approvazioni
INSERT INTO approvazioni (id_spesa, id_responsabile, stato, motivazione, data_approvazione) VALUES
(1, 1, 'approvata', 'Spesa conforme alla policy aziendale', '2025-09-16 14:30:00'),
(2, 1, 'approvata', 'Tariffa economica come richiesto', '2025-09-16 14:32:00'),
(3, 1, 'approvata', 'Importo entro limite giornaliero', '2025-09-16 14:35:00'),
(4, 1, 'approvata', 'Spesa necessaria per trasferta', '2025-09-16 14:38:00'),
(5, 1, 'approvata', 'Importo entro limite giornaliero', '2025-09-16 14:40:00'),
(6, 1, 'respinta', 'Importo eccessivo, tariffa standard è 55€', '2025-09-16 14:42:00'),
(8, 1, 'approvata', 'Hotel convenzionato', '2025-10-26 10:15:00'),
(9, 1, 'approvata', 'Volo a tariffa economica', '2025-10-26 10:18:00'),
(12, 4, 'respinta', 'Mancanza di dettagli sugli ospiti e superamento budget', '2025-10-26 10:30:00'),
(13, 4, 'approvata', 'Hotel convenzionato', '2025-11-12 09:10:00'),
(14, 4, 'approvata', 'Biglietti a tariffa standard', '2025-11-12 09:12:00'),
(15, 4, 'approvata', 'Spesa necessaria per incontro', '2025-11-12 09:15:00'),
(17, 1, 'approvata', 'Hotel conforme a policy', '2025-06-20 11:20:00'),
(18, 1, 'approvata', 'Biglietti in seconda classe come richiesto', '2025-06-20 11:22:00'),
(21, 1, 'approvata', 'Hotel dentro budget', '2025-07-28 15:05:00');


INSERT INTO users (username, password_hash, id_dipendente, is_admin, is_active) VALUES
('fabio', '$2a$12$1lDaCC5xRZExhlaJGkfJ/.lDBZ789y7xw345t4m76a2o/BVu6nskq', 1, TRUE, TRUE),
('niccolo', '$2a$12$7NRi.mLzNQxqnovy7BWoZeDwqfpjMh4rR0U5b8mN4sGHTaaFhOrNS', 2, FALSE, TRUE),
('nicholas', '$2a$12$t2P1Xh7ehVXK62iPSstG/.3C8Z5HrtTsgFrmM4sSvdZSmX0pJOL5m', 3, FALSE, TRUE),
('daniele', '$2a$12$Ceed4rjXQuXq8Ia1e/lZ6Or0K/K9U0WHEeNJQbVjAgPQ/u9o9LUh6', 4, TRUE, TRUE);