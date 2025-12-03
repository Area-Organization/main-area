import { prisma } from '@area/shared';
import { hashPassword } from "../middlewares/password"
import { verifyPassword } from '../middlewares/password';

export class AuthService {
    async userAuth(data: {
        password: string,
        email: string
    }) {
        const user = await prisma.user.findUnique({
            where: {
                email: data.email
            },
        });
        if (!user)
            return null;
        const hash = user.password || "";
        if (hash === "")
            return null;
        const isValid = await verifyPassword(data.password, hash);
        if (!isValid)
            return null;
        return user;
    }

    async getUserById(data: {
        id: string
    }) {
        const user = await prisma.user.findUnique({
            where: {
                id: data.id
            },
        })
        return user
    }

    async createUser(data: {
        email: string
        password: string
        name: string
    }) {
        const passwordHash = await hashPassword(data.password)
        const user = await prisma.user.create({
        data: {
            email: data.email,
            name: data.name,
            password: passwordHash
        }
        })
        return user
    }

    async emailExists(email: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { email }
        })
        return user !== null
    }
}

export const authService = new AuthService()