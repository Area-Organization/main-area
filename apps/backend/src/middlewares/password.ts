export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: "argon2id",
    memoryCost: 19456,
    timeCost: 2
  })
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await Bun.password.verify(password, hash)
}

export function validatePasswordStrenght(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8)
      errors.push("Password must be at least 8 characters long")
  
  if (!/[A-Z]/.test(password))
    errors.push("Password must contain at least one uppercase letter")

  if (!/[a-z]/.test(password))
    errors.push("Password must contain at least one lowercase letter")

  if (!/[0-9]/.test(password))
    errors.push("Password must contain at least one number")

  if (!/[^A-Za-z0-9]/.test(password))
    errors.push("Password must contain at least one special character")

  return {
    valid: errors.length === 0,
    errors
  }
}