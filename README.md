# PDM Gestione Spese (TEST)
Sviluppo PDM per gestione spese, test nuovo tech-stack 


## Per iniziare:
Scarica (NodeJS 20LTS)[https://nodejs.org/en/download].

Crea un file .env.local nella cartella "next-dev" con questi dati:

```bash
DB_HOST=il_tuo_host # o localhost se locale
DB_USER=il_tuo_user
DB_PASSWORD=la_psw_del_tuo_db
DB_NAME=il_nome_del_tuo_db
DB_PORT=3306 # opzionale
```

esempio:
```bash
DB_HOST=sql.freedb.tech
DB_USER=freedb_mydatabase
DB_PASSWORD='password123'
DB_NAME=freedb_myuser
```

Installa i pacchetti node:
```bash
npm install
```

---

## Per usare un db in locale
Installa mysql. 

Es, su mac:

```bash
brew install mysql
brew services stop mysql # per non farlo partire a ogni avvio del pc

mysql.server start # "mysql.server stop" per fermarlo
mysql -u root # se vuoi aggiungere una password prima avvia il comando "mysql_secure_installation", scegli una password e usa il comando "mysql -u root -p"
```

Una volta fatto l'accesso alla shell crea il db:

```bash
CREATE DATABASE opencom_pdm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE opencom_pdm;
EXIT;
```

poi da terminale aggiungi il file DB.sql con la struttura del db e il file DB.mockdata.sql con i dati fasulli:
```bash
mysql -u root -p opencom_pdm < DB.sql # oppuere scrivi il percorso completo al file, es: "documents/next-dev/DB.sql"
mysql -u root -p opencom_pdm < DB.mockdata.sql
```

controlla che tutto abbia funzionato rientrando in mysql e scrivendo:
```bash
SHOW TABLES;
```

---

## Per lavorare
Modifica i file dentro "src/app"

## Avvia il server locale:

```bash
npm run dev
```

---

## Tech Stack
- NextJS
- MariaDB
- Typescript
- Tailwind CSS + MUI