export type SpeseType = {
    id: number
    id_trasferta: number
    categoria_spesa: string
    quanto: number | string
    quando: string
    motivo?: string
    fatta_da: number
}


export type UserType = {
    id: number
	nome: string
    cognome: string
    dipartimento: string
    ruolo: string
    email: string
}