// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {

    if (req.method !== "POST") {
        return NextResponse.json(
            { message: "Metodo non consentito" },
            { status: 405 }
        );
    }

  const cookieStore = await cookies();
  // Rimuovi entrambi i cookie
  cookieStore.delete('userData');
  
  return NextResponse.json({ success: true });
}