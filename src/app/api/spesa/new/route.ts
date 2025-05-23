import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from '@/lib/db';
import { requireAuth } from '@/lib/auth-middleware';

// type NuovaSpesaURLParams = {
//   params: {
//     id_trasferta: string;
//   }
// }


export async function POST(
  request: NextRequest,
//   { params }: NuovaSpesaURLParams
) {
  try {

    const user = requireAuth(request);
    const spesa = await request.json();

    const query = `
      INSERT INTO spese (id_dipendente, id_trasferta, descrizione, importo, data_spesa, stato_approvazione, scontrino_url, id_categoria)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await executeQuery(query, [user.id, spesa.id_trasferta, spesa.descrizione, spesa.importo, spesa.data_spesa, spesa.stato_approvazione, spesa.scontrino_url, spesa.id_categoria]);



    return NextResponse.json({ message: "Spesa creata con successo" }, { status: 200 });

  } catch (error) {
    console.error("Errore nella creazione della spesa:", error);
    if (error instanceof Error && error.message === 'Non autorizzato') {
      return NextResponse.json(
        { message: "Non autorizzato" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "Errore durante la creazione della spesa" },
      { status: 500 }
    );
  }

}