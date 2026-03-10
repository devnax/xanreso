import { useEffect, useState } from "react";

type Listener = () => void;

export type ResourceOptions = {
   intialLoad?: boolean;
   interval?: number;
};

type ResourceState<T, A> = {
   data: { [key: string]: T | null };
   error: unknown;
   loading: { [key: string]: boolean };
};


export function createResource<T, A extends object>(fetcher: (args: A) => Promise<T>, options?: ResourceOptions) {
   const initialLoad = options?.intialLoad ?? true
   const state: ResourceState<T, A> = {
      data: {},
      error: null,
      loading: {},
   };

   const listeners: { [key: string]: Set<Listener> } = {}
   let intervalId: any = null;

   const notify = (_key: string) => {
      const set = listeners[_key]
      if (set) set.forEach((l) => l())
   }

   const run = async (_key: string, args: A) => {
      if (_key in state.data) return
      state.loading[_key] = true;
      state.data[_key] = null
      notify(_key);
      try {
         const result = await fetcher(args as any);
         state.data[_key] = result
         state.error = null;
      } catch (err) {
         state.error = err;
      } finally {
         state.loading[_key] = false
         notify(_key);
      }
   }
   return function useResource(args?: A) {
      args = args ?? {} as any
      const key = JSON.stringify(args)
      const [, forceRender] = useState({});
      const listener = () => forceRender({})

      useEffect(() => {
         if (!(key in listeners)) listeners[key] = new Set
         listeners[key].add(listener)
         return () => {
            listeners[key].delete(listener)
         }
      }, []);

      useEffect(() => {
         if (initialLoad) run(key, args as A)
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

      return {
         data: state.data[key],
         error: state.error,
         isLoading: state.loading[key],
         isSuccess: !state.loading[key] && !state.error,
         isError: !!state.error,
         reload: async () => {
            delete state.data[key]
            return run(key, args as A);
         },
      };
   };
}