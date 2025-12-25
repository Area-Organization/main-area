/**
 * Recursively replaces placeholders like {{key}} in strings, objects, and arrays
 * using values from the variables object.
 *
 * @param template The object, string, or array to interpolate
 * @param variables The key-value pairs to use for replacement
 * @returns The interpolated structure
 */
export function interpolate(template: any, variables: Record<string, any>): any {
  if (typeof template === "string") {
    // Matches {{ key }} or {{key}}
    return template.replace(/{{(\s*[\w]+\s*)}}/g, (match, key) => {
      const trimmedKey = key.trim()
      const value = variables[trimmedKey]
      // If value is found, replace it. Otherwise, keep the original tag.
      return value !== undefined ? String(value) : match
    })
  } else if (Array.isArray(template)) {
    return template.map((item) => interpolate(item, variables))
  } else if (typeof template === "object" && template !== null) {
    const result: Record<string, any> = {}
    for (const k in template) {
      result[k] = interpolate(template[k], variables)
    }
    return result
  }
  return template
}
