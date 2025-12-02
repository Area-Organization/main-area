import { PrismaClient } from '@area/shared';
import { generateTokenPair, jwtAccess, jwtRefresh } from '../middlewares/jwt';
import { hashPassword } from "../middlewares/password"

export class AuthService {

    // signIn(email, password):
    // register(username, email, password)
    // isEmailAlreadyUsed()
    // isPasswordAndEmailCorrect()
    // getUserById()
    async saveTokenByUserId(userId: string, token: string, expiresAt: Date)
    {
        const user = await prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
                revoked: false
            }
        });
    }

    async validateToken(token: string, type: 'access' | 'refresh')
    {
        try {
            const jwtInstance = type === 'access' ? jwtAccess : jwtRefresh;
            const payload = await jwtInstance.verify(token);

            if (!payload)
                return { valid: false, error: 'Invalid token' };
            if (type === 'refresh') {
                const refreshToken = await prisma.refreshToken.findUnique({
                where: { token }
                });
                if (!refreshToken)
                    return { valid: false, error: 'Refresh token not found' };
                if (refreshToken.revoked)
                    return { valid: false, error: 'Refresh token has been revoked' };
                if (new Date() > refreshToken.expiresAt)
                    return { valid: false, error: 'Refresh token has expired' };
            }
            return { valid: true, payload };
        }
        catch (error) {
            return { valid: false, error: 'Token verification failed' };
        }
    }
    // updateExpiredToken(refreshToken)
    // getAccessToken(refreshToken)

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

    private async getUserByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email }
        });
    }
}

export const authService = new AuthService()