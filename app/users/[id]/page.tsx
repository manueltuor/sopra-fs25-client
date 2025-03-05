"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain } from "@/utils/domain";
//import { User } from "@/types/user";
import { Button, Card, Table, Spin } from "antd";
import type { TableProps } from "antd"; // antd component library allows imports of types
// Optionally, you can import a CSS module or file for additional styling:
// import "@/styles/views/Dashboard.scss";

interface User {
  id: number;
  name: string;
  username: string;
  status: string;
  date: string;
  token: string;
  birthday?: string;
}

interface Params {
  id: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const params = useParams() as unknown as Params;
  const id = params.id;
  // useLocalStorage hook example use
  // The hook returns an object with the value and two functions
  // Simply choose what you need from the hook:
  const {
    // value: token, // is commented out because we dont need to know the token value for logout
    // set: setToken, // is commented out because we dont need to set or update the token value
    clear: clearToken, // all we need in this scenario is a method to clear the token
  } = useLocalStorage<string>("token", ""); // if you wanted to select a different token, i.e "lobby", useLocalStorage<string>("lobby", "");

  const handleLogout = (): void => {
    // Clear token using the returned function 'clear' from the hook
    clearToken();
    router.push("/login");
  };
  console.log(id)
  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (id) {
      const apiUrl = `${getApiDomain()}/users/${id}`;
      console.log("Fetching from:", apiUrl); // Debugging output
  
      fetch(apiUrl, {
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => {
          if (!response.ok) throw new Error("User not found");
          return response.json();
        })
        .then((data) => setUser(data))
        .catch((error) => {
          console.error("Error fetching user data:", error);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, router, apiService]);
   // dependency apiService does not re-trigger the useEffect on every render because the hook uses memoization (check useApi.tsx in the hooks).
  // if the dependency array is left empty, the useEffect will trigger exactly once
  // if the dependency array is left away, the useEffect will run on every state change. Since we do a state change to users in the useEffect, this results in an infinite loop.
  // read more here: https://react.dev/reference/react/useEffect#specifying-reactive-dependencies

  if (loading) {
    return (
      <div className="login-container">
          <h1>loading...</h1>
      </div>
    );
  }

  if (user === undefined) return <div>Loading...</div>;
  if (user === null) return <div>User not found.</div>;

  const localToken = localStorage.getItem("token")?.trim().replace(/^"|"$/g, "");
  const userToken = user?.token?.trim().toString();
  const isEdit = localToken === userToken;

  return (
    <div className="card-container">
      <Card
        title="Profile:"
        loading={!user}
        className="dashboard-container"
      >
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Status:</strong> {user.status}</p>
        <p><strong>Created:</strong> {user.date}</p>
        {user.birthday && <p><strong>Birthday:</strong> {user.birthday}</p>}
        <Button onClick={() => router.push("/users")} type="primary">
          Back
        </Button>
        {isEdit && (
          <Button type="primary" htmlType="submit" onClick={() => router.push(`/users/${id}/edit`)}>
            Edit
          </Button>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;