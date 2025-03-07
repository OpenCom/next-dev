export type SpeseType = {
    id: number
    costo: number
    motivo: string
    pagata_da: number
}

export type DipendenteType = {
    id: number
    nome: string
    email: string
}


export type UserType = {
    id_user: number
	name: string
    surname: string
    user: string
    password: string
    email: string
    id_usertype: number
    id_partner: number
    id_student: number
    deleted: number
}