import { prisma } from '@area/shared';
import { hashPassword } from "../middlewares/password"

export class AuthService {

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