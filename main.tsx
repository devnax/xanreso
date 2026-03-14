import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createResource } from './src'

export const useUserResource = createResource(
  async (args?: { gender?: string; results?: number }) => {
    const url = new URL("https://randomuser.me/api/");
    if (args?.gender) url.searchParams.set("gender", args.gender);
    if (args?.results) url.searchParams.set("results", String(args.results));
    const res = await fetch(url.toString());
    return (await res.json()).results;
  },
  {
    // initialLoad: false
    // interval: 3000
  }
);

function Users() {
  const [dep, setDep] = useState(0)
  const users = useUserResource({ gender: "male" }, [dep]);
  console.log(users);

  return (
    <div>

      <button onClick={() => {
        // users.reload()
        setDep(Math.random())
      }}>Reload</button>
    </div>
  );
}

const View = () => {
  const users = useUserResource({ gender: "male" });
  if (users.isLoading) return <p>Loading...</p>;
  if (!users.data) return <p>No users</p>;
  return (
    <div>
      {users.data.map((u: any, i: number) => (
        <p key={i}>{u.name.first} {u.name.last}</p>
      ))}
    </div>
  );
}

const Female = () => {
  const users = useUserResource({ gender: "male" });
  if (users.isLoading) return <p>Loading...</p>;
  if (!users.data) return <p>No users</p>;
  return (
    <div>
      {users.data.map((u: any, i: number) => (
        <p key={i}>{u.name.first} {u.name.last}</p>
      ))}
    </div>
  );
}

const App = () => {
  return (
    <div style={{ fontFamily: 'monospace,math, sans-serif', textAlign: 'center', marginTop: '50px' }}>
      <Users />
      {/* <View /> */}
      {/* <Female /> */}
    </div>
  );
}
const rootEle = document.getElementById('root')
if (rootEle) {
  const root = createRoot(rootEle);
  root.render(<App />);
}