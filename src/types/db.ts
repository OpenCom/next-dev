export type DipendenteType = {
    id_dipendente: number
    id_dipartimento: number
    nome: string
    cognome: string
    email: string
    ruolo: RuoloType
}

export type RuoloType = 'responsabile' | 'dipendente' | 'contabile' | 'esterno'

export type UserType = {
    id_user: number
    username: string
    password_hash: string
    id_dipendente: number
    is_admin: boolean
    ultimo_accesso?: string
    reset_token?: string
    reset_token_expiry?: string
    is_active: boolean
    created_at: string
    updated_at?: string
}

export type ProgettoType = {
    id_progetto: number
    nome: string
    data_inizio: string
    data_fine?: string
}

export type CategoriaSpesaType = {
    id_categoria: number
    nome: string
}

export type SpesaConCategoria = {
    uuid_spesa: string;
    nome_trasferta: string;
    nome_categoria: string;
    descrizione: string;
    data_spesa: string;
    importo: number;
    stato_approvazione: 'presentata' | 'approvata' | 'respinta';
    scontrino_url: string | null;
  };

export type TrasfertaType = {
    id_trasferta: number
    uuid_trasferta: string
    id_progetto: number
    luogo: string
    data_inizio: string
    data_fine?: string
    id_responsabile: number
    budget: number
    motivo_viaggio?: string
    note?: string
}

export type TrasfertaPartecipantiType = {
    id_trasferta: number
    id_dipendente: number
}

export type SpesaType = {
    id_spesa: number
    uuid_spesa: string
    id_trasferta: number
    id_categoria: number
    id_dipendente: number
    data_spesa: string
    descrizione: string
    importo: number
    scontrino_url?: string
    stato_approvazione: 'presentata' | 'approvata' | 'respinta'
    is_deleted: boolean
    created_at: string
    updated_at: string
}

export type ApprovazioneType = {
    id_approvazione: number
    id_spesa: number
    id_responsabile: number
    stato: 'approvata' | 'respinta'
    motivazione: string
    data_approvazione: string
}