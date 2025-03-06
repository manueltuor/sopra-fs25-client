// this code is part of S2 to display a list of all registered users
// clicking on a user in this list will display /app/users/[id]/page.tsx
"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Table } from "antd";
import type { TableProps } from "antd"; // antd component library allows imports of types
import { error } from "console";
// Optionally, you can import a CSS module or file for additional styling:
// import "@/styles/views/Dashboard.scss";

// Columns for the antd table of User objects
const columns: TableProps<User>["columns"] = [
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "Created",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
];

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // apiService.get<User[]> returns the parsed JSON object directly,
        // thus we can simply assign it to our users variable.
        const users: User[] = await apiService.get<User[]>("/users", {
          headers: {
            Authorization: token.trim().replace(/^"|"$/g, ""),
          },
        });
        setUsers(users);
        console.log("Fetched users:", users);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while fetching users:\n${error.message}`);
        } else {
          console.error("An unknown error occurred while fetching users.");
        }
      } finally {
        setLoading(false); 
      }
    };

    fetchUsers();
  }, [apiService]); // dependency apiService does not re-trigger the useEffect on every render because the hook uses memoization (check useApi.tsx in the hooks).
  // if the dependency array is left empty, the useEffect will trigger exactly once
  // if the dependency array is left away, the useEffect will run on every state change. Since we do a state change to users in the useEffect, this results in an infinite loop.
  // read more here: https://react.dev/reference/react/useEffect#specifying-reactive-dependencies

  const handleLogout = async (): Promise<void> => { 
    const id = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
  
    if (!id || !token) {
      alert("User ID or token not found. Please log in again.");
      router.push("/login");
      return;
    }
    
    console.log("ID: ", parseInt(id), typeof(parseInt(id)));
    console.log("TOKEN: ", token, typeof(token));
 

    try {
      const response = await apiService.put("/users/logout", { 
        id: parseInt(id), 
        token: token.trim().replace(/^"|"$/g, ""),
      });
      
  
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
  
      router.push("/login");
  
    } catch (error) {
      console.log("Error setting the status to OFFLINE: ", error);
      alert("An error occurred while logging out");
    } 
  };

  return (
    <div className="card-container">
      <Card
        title="Get all users from secure endpoint:"
        loading={loading}
        className="dashboard-container"
      >
        {users && (
          <>
            {/* antd Table: pass the columns and data, plus a rowKey for stable row identity */}
            <Table<User>
              columns={columns}
              dataSource={users}
              rowKey="id"
              onRow={(row) => ({
                onClick: () => router.push(`/users/${row.id}`),
                style: { cursor: "pointer" },
              })}
            />
            <Button onClick={handleLogout} type="primary">
              Logout
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
