Perfect! I’ve drafted a **beautiful, professional documentation** for your final `xanreso` version. It covers everything: installation, usage, options, and examples.

---

# **xanreso — React Hook-First Async Resource Library**

A tiny, hook-first library to manage async data fetching in React with **automatic re-renders, caching per arguments, polling, and reload support**.

---

## **Installation**

```bash
npm install xanreso
# or
yarn add xanreso
```

---

## **API**

### **createResource(fetcher, options?)**

Creates a React hook for your async resource.

**Parameters:**

| Name      | Type                      | Description                                                         |
| --------- | ------------------------- | ------------------------------------------------------------------- |
| `fetcher` | `(args: A) => Promise<T>` | Async function that fetches your data. Receives optional arguments. |
| `options` | `ResourceOptions`         | Optional configuration object.                                      |

**ResourceOptions:**

| Option       | Type      | Default     | Description                                                     |
| ------------ | --------- | ----------- | --------------------------------------------------------------- |
| `intialLoad` | `boolean` | `true`      | Whether to automatically load data when the hook is first used. |
| `interval`   | `number`  | `undefined` | Polling interval in milliseconds to automatically reload data.  |

**Returns:**

A React hook: `(args?: A) => ResourceHookResult<T>`

---

### **ResourceHookResult<T>**

| Property    | Type                  | Description                              |
| ----------- | --------------------- | ---------------------------------------- |
| `data`      | `T \| null`           | Fetched data for the given arguments.    |
| `error`     | `unknown`             | Error object if fetch fails.             |
| `isLoading` | `boolean`             | `true` while data is loading.            |
| `isSuccess` | `boolean`             | `true` if loading finished successfully. |
| `isError`   | `boolean`             | `true` if there was an error.            |
| `reload()`  | `() => Promise<void>` | Reloads the resource manually.           |

---

## **Basic Usage**

```ts
import { createResource } from "xanreso";

// Create the hook
export const useUserResource = createResource(
  async () => {
    const res = await fetch("https://randomuser.me/api/");
    return (await res.json()).results[0];
  }
);

// Component
function Profile() {
  const user = useUserResource();

  if (user.isLoading) return <p>Loading...</p>;
  if (!user.data) return <p>No user data</p>;

  return (
    <div>
      <img src={user.data.picture.large} />
      <h2>{user.data.name.first} {user.data.name.last}</h2>
      <button onClick={user.reload}>Reload</button>
    </div>
  );
}
```

---

## **Using Arguments**

```ts
// Hook with args
export const useUsersResource = createResource(
  async ({ results, gender }: { results?: number; gender?: string }) => {
    const url = new URL("https://randomuser.me/api/");
    if (results) url.searchParams.set("results", String(results));
    if (gender) url.searchParams.set("gender", gender);
    const res = await fetch(url.toString());
    return (await res.json()).results;
  }
);

// Component
function UsersList() {
  const users = useUsersResource({ results: 5, gender: "female" });

  if (users.isLoading) return <p>Loading...</p>;

  return (
    <ul>
      {users.data?.map((u, i) => (
        <li key={i}>{u.name.first} {u.name.last}</li>
      ))}
    </ul>
  );
}
```

---

## **Polling / Auto Reload**

```ts
export const useLiveUsers = createResource(
  async () => {
    const res = await fetch("https://randomuser.me/api/");
    return (await res.json()).results[0];
  },
  { interval: 5000 } // reload every 5 seconds
);

function LiveProfile() {
  const user = useLiveUsers();

  return (
    <div>
      {user.isLoading ? "Loading..." : user.data?.name.first}
      <button onClick={user.reload}>Reload Now</button>
    </div>
  );
}
```

---

## **Features**

* ✅ Hook-first API — easy to use in components
* ✅ Shared state per argument combination
* ✅ Auto re-render of all components using the hook
* ✅ Polling support with `interval`
* ✅ Manual reload with `reload()`
* ✅ Simple argument-based caching
* ✅ Tiny and dependency-free

---

## **Best Practices**

* Always call your hook at the **top level of the component**.
* For multiple datasets, call the hook with **different argument objects**.
* Do not call React hooks inside the fetcher — pass hook values as arguments instead.
