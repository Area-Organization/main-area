import { prisma } from '@area/shared';
import { hashPassword } from "../middlewares/password"

export class AuthService {

    // signIn(email, password):
    // register(username, email, password)
    // isPasswordAndEmailCorrect()
    // créer un token pour verifier l'email de l'utilisateur (verfiier si il a reçu un mail)
    // updateExpiredToken(refreshToken)
    // getAccessToken(refreshToken)

    //  savegarder un refresh token
    //  verifier si un refresh token est valid

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
    
    async emailExists(email: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { email }
        })
        return user !== null
    }
}

export const authService = new AuthService()