import { useEffect, useMemo, useState } from "react";
type Listener = () => void;

export type ResourceOptions = {
   interval?: number;
};

type ResourceState<T> = {
   data: { [key: string]: T | null };
   error: { [key: string]: unknown };
   loading: { [key: string]: boolean };
};

export function createResource<T, A extends object>(fetcher: (args: A) => Promise<T>, options?: ResourceOptions) {
   const state: ResourceState<T> = {
      data: {},
      error: {},
      loading: {},
   };

   const depsState: { [key: string]: string } = {}
   const listeners: { [key: string]: Set<Listener> } = {}
   let intervalId: any = null;

   const notify = (_key: string) => {
      const set = listeners[_key]
      if (set) set.forEach((l) => l())
   }

   const run = async (_key: string, args: A, firstLoad = false) => {
      if (_key in state.data) return
      state.loading[_key] = true;
      state.data[_key] = null
      if (!firstLoad) notify(_key);
      try {
         const result = await fetcher(args as any);
         state.data[_key] = result
         delete state.error[_key]
      } catch (err) {
         state.error[_key] = err;
      } finally {
         state.loading[_key] = false
         notify(_key);
      }
   }

   return function useResource(args?: A, deps?: any[]) {
      args = args ?? {} as any
      const key = JSON.stringify(args)
      const [, forceRender] = useState({});
      const [init, setInit] = useState(false);
      const listener = () => forceRender({})

      useMemo(() => {
         state.loading[key] = true
      }, [])

      useEffect(() => {
         if (!(key in listeners)) listeners[key] = new Set
         listeners[key].add(listener)
         setInit(true)

         return () => {
            listeners[key].delete(listener)
         }
      }, []);

      useEffect(() => {
         if (!intervalId && options?.interval) {
            intervalId = setInterval(() => {
               state.data = {}
               for (let k in listeners) {
                  run(k, args as A)
               }
            }, options?.interval);
         }
         return () => {
            clearInterval(intervalId)
         }
      }, [key]);

      useEffect(() => {
         if (deps) {
            if (init) {
               const dkey = JSON.stringify(deps)
               const current = depsState[key]
               if (current !== dkey) {
                  depsState[key] = dkey
                  delete state.data[key]
                  run(key, args as A, true)
               }
            }
         } else {
            run(key, args as A, true)
         }

      }, [deps])

      const loading = state.loading[key]

      return {
         data: state.data[key] || null,
         isLoading: loading,
         error: state.error[key],
         reload: async () => {
            state.data = {}
            for (let k in listeners) {
               run(k, args as A)
            }
         },
      };
   };
}