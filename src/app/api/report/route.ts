import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id_dipendente;
    const isAdmin = session.user.is_admin;

    // Base query for expenses
    let query = `
      SELECT 
        t.id_trasferta,
        t.budget,
        s.importo,
        s.stato_approvazione,
        c.nome as categoria,
        t.luogo as trasferta,
        p.nome as progetto
      FROM trasferte t
      LEFT JOIN spese s ON t.id_trasferta = s.id_trasferta
      LEFT JOIN categorie_spese c ON s.id_categoria = c.id_categoria
      LEFT JOIN progetti p ON t.id_progetto = p.id_progetto
      WHERE s.is_deleted = 0
    `;

    // Add user-specific filter for non-admin users
    if (!isAdmin) {
      query += ` AND (t.id_responsabile = ? OR s.id_dipendente = ?)`;
    }

    const params = isAdmin ? [] : [userId, userId];
    const results = await executeQuery(query, params);

    // Process results
    const stats = {
      totalSpese: 0,
      totalBudget: 0,
      speseByCategoria: [] as any[],
      speseByTrasferta: [] as any[],
      speseByStato: [] as any[],
      speseByProgetto: [] as any[],
    };

    const categoriaMap = new Map();
    const trasfertaMap = new Map();
    const statoMap = new Map();
    const countedTripBudgets = new Set();
    const progettoMap = new Map();
    results.forEach((row: any) => {
      // Calculate totals
      stats.totalSpese += parseFloat(row.importo) || 0;
      
      // Only count budget once per trip
      if (row.id_trasferta && !countedTripBudgets.has(row.id_trasferta)) {
        stats.totalBudget += parseFloat(row.budget) || 0;
        countedTripBudgets.add(row.id_trasferta);
      }

      // Aggregate by category
      if (row.categoria) {
        const current = categoriaMap.get(row.categoria) || { categoria: row.categoria, total: 0, count: 0 };
        current.total += parseFloat(row.importo) || 0;
        current.count++;
        categoriaMap.set(row.categoria, current);
      }

      // Aggregate by trip
      if (row.trasferta) {
        const current = trasfertaMap.get(row.trasferta) || { 
          trasferta: row.trasferta, 
          progetto: row.progetto,
          total: 0, 
          count: 0 
        };
        current.total += parseFloat(row.importo) || 0;
        current.count++;
        trasfertaMap.set(row.trasferta, current);
      }

      // Aggregate by status (only for non-admin users)
      if (!isAdmin && row.stato_approvazione) {
        const current = statoMap.get(row.stato_approvazione) || { stato: row.stato_approvazione, total: 0, count: 0 };
        current.total += parseFloat(row.importo) || 0;
        current.count++;
        statoMap.set(row.stato_approvazione, current);
      }

      // Aggregate by project
      if (row.progetto) {
        const current = progettoMap.get(row.progetto) || { progetto: row.progetto, total: 0, count: 0 };
        current.total += parseFloat(row.importo) || 0;
        current.count++;
        progettoMap.set(row.progetto, current);
      }
    }); 

    // Convert maps to arrays
    stats.speseByCategoria = Array.from(categoriaMap.values());
    stats.speseByTrasferta = Array.from(trasfertaMap.values());
    if (!isAdmin) {
      stats.speseByStato = Array.from(statoMap.values());
    }
    stats.speseByProgetto = Array.from(progettoMap.values());

    return NextResponse.json({ stats, isAdmin });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
