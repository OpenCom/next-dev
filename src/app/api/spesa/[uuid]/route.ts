import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from '@/lib/db';
import type { SpesaType } from '@/types/db';
import { requireAuth } from '@/lib/auth-middleware';
import { User } from "next-auth";

type SpeseURLParams = {
  params: {
    uuid: string;
  }
}


async function checkSpesaPermission(spesa: SpesaType, user: any, uuid: string): Promise<boolean | NextResponse> {

    // Verify that the user has permission to modify this spesa
    const checkQuery = `
      SELECT id_dipendente 
      FROM spese 
      WHERE uuid_spesa = ?
    `;
    const spesaResult = await executeQuery(checkQuery, [uuid]);
    
    if (!spesaResult || (Array.isArray(spesaResult) && spesaResult.length === 0)) {
      return NextResponse.json(
        { message: "Spesa non trovata" },
        { status: 404 }
      );
    }

    const spesaData = Array.isArray(spesaResult) ? spesaResult[0] : spesaResult;
    
    // Allow modification if user is the owner or has responsabile or contabile role
    if (spesaData.id_dipendente !== parseInt(user.id) && user.role !== 'responsabile') {
      return NextResponse.json(
        { message: "Non hai i permessi per modificare questa spesa" },
        { status: 403 }
      );
    }

    return true;
}




export async function DELETE(
  request: NextRequest,
  { params }: SpeseURLParams
) {
  try {
    // Verify authentication
    const user = requireAuth(request);
    
    const { uuid } = await params;
    const spesa: SpesaType = await request.json();

    const permission = await checkSpesaPermission(spesa, user, uuid);
    if (!permission) {
      throw new Error('Non autorizzato');
    }

    const query = `
      UPDATE spese 
      SET 
        is_deleted = 1
      WHERE uuid_spesa = ?
    `;

    await executeQuery(query, [uuid]);

    return NextResponse.json({ message: "Spesa eliminata con successo" }, { status: 200 });

  } catch (error) {
    console.error("Error deleting spesa:", error);
    if (error instanceof Error && error.message === 'Non autorizzato') {
      return NextResponse.json(
        { message: "Non autorizzato" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "Errore durante la cancellazione della spesa" },
      { status: 500 }
    );
  }

}

export async function PUT(
  request: NextRequest,
  { params }: SpeseURLParams
) {
  try {
    // Verify authentication
    const user = requireAuth(request);
    
    const { uuid } = await params;
    const spesa: SpesaType = await request.json();

    // Validate required fields
    if (!spesa.descrizione || !spesa.importo || !spesa.data_spesa) {
      return NextResponse.json(
        { message: "Campi obbligatori mancanti" },
        { status: 400 }
      );
    }

    const permission = await checkSpesaPermission(spesa, user, uuid);
    if (!permission) {
      throw new Error('Non autorizzato');
    }


    const query = `
      UPDATE spese 
      SET 
        descrizione = ?,
        importo = ?,
        data_spesa = ?,
        stato_approvazione = ?,
        scontrino_url = ?,
        id_categoria = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE uuid_spesa = ?
    `;

    await executeQuery(query, [
      spesa.descrizione,
      spesa.importo,
      spesa.data_spesa,
      spesa.stato_approvazione,
      spesa.scontrino_url || null,
      spesa.id_categoria,
      uuid
    ]);

    return NextResponse.json({ message: "Spesa aggiornata con successo" }, { status: 200 });

  } catch (error) {
    console.error("Error updating spesa:", error);
    if (error instanceof Error && error.message === 'Non autorizzato') {
      return NextResponse.json(
        { message: "Non autorizzato" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "Errore durante l'aggiornamento della spesa" },
      { status: 500 }
    );
  }
} 