# PDM Gestione Spese (TEST)
Sviluppo PDM per gestione spese, test nuovo tech-stack 


## Per iniziare:
Scarica (NodeJS 20LTS)[https://nodejs.org/en/download].

Crea un file .env.local nella cartella "next-dev" con questi dati:

```bash
DB_HOST=il_tuo_host (senza http:// e senza porta)
DB_USER=il_tuo_user
DB_PASSWORD=la_psw_del_tuo_db
DB_NAME=il_nome_del_tuo_db
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