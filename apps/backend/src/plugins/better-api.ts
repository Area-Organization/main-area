import { auth } from "../database/auth"

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>

const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema())

export const OpenAPI = {
  getPaths: async (prefix = '/api/auth') => {
    const { paths } = await getSchema()
    const reference: Record<string, any> = Object.create(null)

    for (const pathKey of Object.keys(paths)) {
      const pathValue = paths[pathKey]
      if (!pathValue) continue

      const key = prefix + pathKey
      reference[key] = { ...pathValue }

      for (const method of Object.keys(pathValue)) {
        const operation = reference[key][method]
        if (operation) {
          operation.tags = ['Better Auth']
        }
      }
    }

    return reference
  },

  components: getSchema().then(({ components }) => components) as Promise<any>
} as const
