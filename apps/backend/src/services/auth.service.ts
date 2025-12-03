import { prisma } from '@area/shared';
import { hashPassword } from "../middlewares/password"
import { verifyPassword } from '../middlewares/password';

export class AuthService {
    async userAuth(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user || !user.password)
            return null;
        const isValid = await verifyPassword(password, user.password);
        if (!isValid)
            return null;
        return user;
    }

    async getUserById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
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