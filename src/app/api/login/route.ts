import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import bcrypt from "bcrypt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metodo non consentito" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email e password sono obbligatori" });
  }

  let conn: any;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]); // Il punto interrogativo ? nella query è un placeholder per il parametro email che aiuta a prevenire vulnerabilità come SQL Injection.

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "User non trovato" });
    }
    const user = rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const tentativiRimanenti = user.tentativi_accesso_rimasti - 1;

      // Se i tentativi sono finiti, blocca l'account
      if (tentativiRimanenti <= 0) {
        await conn.query(`UPDATE users SET bloccato = TRUE WHERE user_id = ?`, [
          user.user_id,
        ]);
        return res.status(401).json({
            success: false,
            message: "Account bloccato, troppi tentativi errati. Contatta il reparto ICT.",
          });
      } else {
        // Altrimenti, aggiorna i tentativi di accesso
        await conn.query(
          `UPDATE users SET tentativi_accesso_rimasti = ? WHERE user_id = ?`,
          [tentativiRimanenti, user.user_id]
        );
        return res.status(401).json({
          success: false,
          message: `Password errata. Tentativi rimanenti: ${tentativiRimanenti}`,
        });
      }
    }

    // Login riuscito
    await conn.query(`UPDATE users SET tentativi_accesso_rimasti = 3 WHERE user_id = ?`, [user.user_id]);

    return res.status(200).json({ success: true, message: "Login effettuato con successo" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Errore del server" });
  } finally {
        conn.release();  // Libera la connessione
    }
}
