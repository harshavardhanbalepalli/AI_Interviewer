import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const register = async () => {
    const response = await fetch("http://127.0.0.1:8000/auth/register", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    localStorage.setItem("token", data.access_token);

    navigate("/");
  };

  return (
  <div className="min-h-screen bg-white grid lg:grid-cols-2">
    {/* Left Section */}
    <div className="hidden lg:flex flex-col justify-center px-24 bg-gradient-to-br from-orange-50 to-white">
      <h1 className="text-7xl font-black tracking-tight mb-6">
        <span className="text-orange-500">A</span>h
        <span className="text-orange-500">I</span>re
      </h1>

      <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-6">
        Create Your
        <br />
        Account
      </h2>

      <p className="text-lg text-gray-600 leading-8 max-w-xl">
        Join AhIre to upload your resume, apply for jobs, and complete
        AI-powered interviews designed for modern recruitment.
      </p>
    </div>

    {/* Right Section */}

    <div className="flex justify-center items-center p-8 bg-gray-50">
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-3xl p-10">

        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          Create Account
        </h2>

        <p className="text-gray-500 mb-8">
          Start your journey with AhIre.
        </p>

        <div className="space-y-6">

          <div>
            <Label className="mb-2 block">
              Email
            </Label>

            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl border-gray-300 focus:border-orange-500"
            />
          </div>

          <div>
            <Label className="mb-2 block">
              Password
            </Label>

            <Input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl border-gray-300 focus:border-orange-500"
            />
          </div>

          <Button
            onClick={register}
            className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600"
          >
            Create Account
          </Button>

          <div className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-orange-500 hover:text-orange-600"
            >
              Sign In
            </Link>
          </div>

        </div>

      </Card>
    </div>
  </div>
);
}

export default Register;
