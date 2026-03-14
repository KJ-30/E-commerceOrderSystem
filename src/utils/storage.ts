type StorageType = 'local' | 'session'

class Storage {
  private storage: globalThis.Storage

  constructor(type: StorageType = 'local') {
    this.storage = type === 'local' ? localStorage : sessionStorage
  }

  set<T>(key: string, value: T, expire?: number): void {
    const data = {
      value,
      expire: expire ? Date.now() + expire * 1000 : null
    }
    this.storage.setItem(key, JSON.stringify(data))
  }

  get<T>(key: string): T | null {
    const dataStr = this.storage.getItem(key)
    if (!dataStr) return null

    try {
      const data = JSON.parse(dataStr)
      if (data.expire && Date.now() > data.expire) {
        this.remove(key)
        return null
      }
      return data.value as T
    } catch {
      return null
    }
  }

  remove(key: string): void {
    this.storage.removeItem(key)
  }

  clear(): void {
    this.storage.clear()
  }

  has(key: string): boolean {
    return this.storage.getItem(key) !== null
  }
}

export const localStore = new Storage('local')
export const sessionStore = new Storage('session')

export default {
  local: localStore,
  session: sessionStore
}
