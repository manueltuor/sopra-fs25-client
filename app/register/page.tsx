"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";

interface FormFieldProps {
  name: string;
  username: string;
  password: string;
  birthday: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  
  const handleRegister = async (values: FormFieldProps) => {
    try {
      // Call the API service and let it handle JSON serialization and error handling
      const response = await apiService.post<User>("/users", values);

      // Navigate to the login page
      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during the registration:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during registration.");
      }
    }
  };

  return (
    <div className="login-container">
      <Form
        form={form}
        name="login"
        size="large"
        variant="outlined"
        onFinish={handleRegister}
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
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please input your name!" }]}
        >
          <Input placeholder="Enter name" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input placeholder="Enter password" type="password"/>
        </Form.Item>
        <Form.Item
          name="birthday"
          label="Birthday"
        >
          <Input placeholder="Enter birthday (optional)" type="date"/>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            Register
          </Button>
        </Form.Item>
        <Button type="link" htmlType="submit" className="register-button" onClick={() => router.push("/login")}>
          Already registered? Login here!
        </Button>
      </Form>
    </div>
  );
};

export default Register;
