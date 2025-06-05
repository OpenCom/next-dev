// create db
import { createDatabase } from '@/lib/createDb';
import { NextResponse } from 'next/server';

export async function POST() { //request: NextRequest

    if (process.env.ALLOW_DB_CREATION !== 'true') {
        return NextResponse.json({ message: 'Database already created' }, { status: 400 });
    }

    await createDatabase('opencom_pdm');
    return NextResponse.json({ message: 'Database created successfully' });
}