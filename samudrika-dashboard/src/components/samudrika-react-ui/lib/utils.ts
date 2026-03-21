type ClassDictionary = Record<string, boolean | null | undefined>
type ClassArray = ClassValue[]
type ClassValue = string | number | boolean | null | undefined | ClassDictionary | ClassArray

export function cn(...inputs: ClassValue[]) {
  const classes: string[] = []

  const pushValue = (value: ClassValue) => {
    if (!value) return
    if (typeof value === 'string' || typeof value === 'number') {
      classes.push(String(value))
      return
    }
    if (Array.isArray(value)) {
      value.forEach(pushValue)
      return
    }
    if (typeof value === 'object') {
      Object.entries(value).forEach(([key, enabled]) => {
        if (enabled) classes.push(key)
      })
    }
  }

  inputs.forEach(pushValue)
  return classes.join(' ')
}
