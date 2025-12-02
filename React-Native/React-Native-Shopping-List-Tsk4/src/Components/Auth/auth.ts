// Authentication related type definitions

export type SignUpFormData = {
    name: string;
    surname: string;
    email: string;
    cellNumber: string;
    password: string;
}

export type SignInFormData = {
    email: string;
    password: string;
}

export type User = {
    id: string;
    name: string;
    surname: string;
    email: string;
    cellNumber: string;
    createdAt: Date;
}
