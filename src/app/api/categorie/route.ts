import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { CategoriaSpesaType } from '@/types/db';

export async function GET() {
  try {
    const query = "SELECT id_categoria, nome FROM categorie_spese ORDER BY nome ASC";
    const categorie = await executeQuery<CategoriaSpesaType[]>(query, []);

    if (!categorie) {
        return NextResponse.json({ message: "Errore durante il recupero delle categorie" }, { status: 500 });
    }

    return NextResponse.json(categorie, { status: 200 });
  } catch (error) {
    console.error("Errore nel recupero delle categorie:", error);
    return NextResponse.json(
      { message: "Errore durante il recupero delle categorie" },
      { status: 500 }
    );
  }
}
