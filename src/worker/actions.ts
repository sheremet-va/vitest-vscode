import type { VitestPool } from '../api/rpc'
import type { Vitest } from './vitest'

export function createWorkerMethods(vitestById: Record<string, Vitest>): VitestPool {
  return new Proxy<any>({
    async close() {
      for (const vitest in vitestById) {
        try {
          await vitestById[vitest].dispose()
        }
        catch {
          // ignore
        }
      }
    },
  }, {
    get(target, prop) {
      if (prop === 'close')
        return Reflect.get(target, prop)

      return function (id: string, ...args: any[]) {
        const vitest = vitestById[id]
        if (!vitest)
          throw new Error(`Vitest instance not found with id: ${id}`)
        if (prop in vitest)
          return vitest[prop as 'collectTests'](...args as [any])
        else
          throw new Error(`Method not found: ${String(prop)}`)
      }
    },
  })
}
