"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
import { useEffect} from "react";
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
  
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { value: userId, set: setUserId } = useLocalStorage<number>("userId", 0);

  useEffect(() => {
    if (userId) {
      router.push(`/users/${userId}`);
    }
  }, [userId, router]);

  const handleLogin = async (values: FormFieldProps) => {
    try {
      const response = await apiService.post<User>("/login/auth", values);
      console.log("USER: ", response);

      // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
      if (response.token) {
        setToken(response.token);
      }
      if (response.id) {
        setUserId(parseInt(response.id));
      }
      // Go to users page
      router.push("/users");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during the login:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during login.");
      }
    }
  };

  return (
    <div className="login-container" style={{display: "flex", flexDirection: "column"}}>
      <Form form={form} name="login" size="large"
        variant="outlined" onFinish={handleLogin} layout="vertical"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>
        <Form.Item name="password" label="Password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input placeholder="Enter password" type="password"/>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">Login</Button>
        </Form.Item>
        <Button type="link" htmlType="submit" className="register-button" onClick={() => router.push("/register")}>
          You are not registered yet? Register here!
        </Button>
      </Form>
    </div>
  );
};

export default Login;
