"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
import { useEffect, useState } from "react";
// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";

interface FormFieldProps {
  label: string;
  value: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  // useLocalStorage hook example use
  // The hook returns an object with the value and two functions
  // Simply choose what you need from the hook:
  const [loading, setLoading] = useState(false);

  const { value: token, set: setToken } = useLocalStorage<string>("token", "");
  const { value: userId, set: setUserId } = useLocalStorage<string>("userId", "");

  useEffect(() => {
    if (userId) {
      router.push(`/users/${userId}`);
    }
  }, [userId, router]);

  const handleLogin = async (values: FormFieldProps) => {
    try {
      // Call the API service and let it handle JSON serialization and error handling
      const response = await apiService.post<User>("/login/auth", values);

      // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
      if (response.token) {
        setToken(response.token);
      }

      if (response.id) {
        setUserId(response.id);
      }
      setLoading(false);

      // Navigate to the user overview
      router.push("/users");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during the login:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during login.");
      }
      setLoading(false);
    }
  };

  //if (loading) {
  //  return (
  //    <div className="login-container">
  //        <h1>loading...</h1>
  //    </div>
  //  );
  //}

  return (
    <div className="login-container" style={{display: "flex", flexDirection: "column"}}>
      <Form
        form={form}
        name="login"
        size="large"
        variant="outlined"
        onFinish={handleLogin}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input placeholder="Enter password" type="password"/>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            Login
          </Button>
        </Form.Item>
        <Button type="link" htmlType="submit" className="register-button" onClick={() => router.push("/register")}>
          You are not registered yet? Register here!
        </Button>
      </Form>
    </div>
  );
};

export default Login;
