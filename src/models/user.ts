export interface CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    hashedPassword?: string;
    createdAt: Date;
    updatedAt: Date;
}