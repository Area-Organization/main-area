import { prisma, PrismaClient } from '@area/shared';
import { generateTokenPair, jwtAccess, jwtRefresh } from '../middlewares/jwt';
import { hashPassword } from "../middlewares/password"

export class AuthService {

    async emailExist(data: {
        email: string
    }) {
        const user = await prisma.user.findUnique({
            where: {
                email: data.email
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
}

export const authService = new AuthService()