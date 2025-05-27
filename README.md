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
JWT_SECRET='<secret_per_token:https://jwtsecret.com/generate>'
```

esempio:
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD='admin'
DB_NAME=opencom_pdm
DB_PORT=3306
JWT_SECRET=931a4115f32f38acc2b8738b934c0028d64b1f92364598eb0daa2d5fa61c82d2c542eab001a233a9509c219d34bc51f48f2fea3273cb5c9268f92c1405e5bafe79fb0f8750520f21989011099d054490803ce88ea572980611263e084f3b78df0f63055dcf9d6c300ca619323ce985f007a36a368dd86d696110db4c1764562bf6464c6a0d8f084b93e8786a5ed4899643e56815b21f0f596dcc3b559f9c43fd245b51ac580ce9dbcfefac7e2e3716f7af0fcec74c9eb5a7544ba3e335ef10e0ed7a09ab6b6b03dae96285755b99cdb91e8017b1d11a6d6db6f296a4e23ff9c985f19d604dc0a08899515b1100656da12ae67b5a41f032e4e17d12e40feef637
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