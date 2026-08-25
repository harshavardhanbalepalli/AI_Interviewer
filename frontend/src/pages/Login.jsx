import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { decodeToken } from "@/lib/utils";
import {
  BrainCircuit,
  FileSearch,
  BriefcaseBusiness,
  Mic,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem(
        "token",
        data.access_token
      );

      const payload = decodeToken(data.access_token);

      navigate(payload?.role === "admin" ? "/admin" : "/");
    } catch (error) {
      alert(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
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
        Intelligent Hiring
        <br />
        Starts Here.
      </h2>

      <p className="text-lg text-gray-600 leading-8 mb-10 max-w-xl">
        Find opportunities, apply with confidence, and complete AI-powered
        screening interviews—all from one intelligent recruitment platform.
      </p>

      <div className="space-y-6 text-gray-700">
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-xl">
            <FileSearch className="text-orange-500 w-6 h-6" />
          </div>

          <span className="text-lg font-medium">
            AI Resume Analysis
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-xl">
            <Mic className="text-orange-500 w-6 h-6" />
          </div>

          <span className="text-lg font-medium">
            AI Voice Screening
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-xl">
            <BrainCircuit className="text-orange-500 w-6 h-6" />
          </div>

          <span className="text-lg font-medium">
            Smart Candidate Evaluation
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-xl">
            <BriefcaseBusiness className="text-orange-500 w-6 h-6" />
          </div>

          <span className="text-lg font-medium">
            Job Applications & Tracking
          </span>
        </div>
      </div>
    </div>

    {/* Right Section */}
    <div className="flex justify-center items-center p-8 bg-gray-50">
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-3xl p-10">
       <h2 className="text-4xl font-bold text-gray-900 mb-2">
  Welcome to AhIre
</h2>

<p className="text-gray-500 mb-8">
  Sign in or create a new account to continue.
</p>

        <div className="space-y-6">
          <div>
            <Label className="text-gray-700 mb-2 block">
              Email
            </Label>

            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div>
            <Label className="text-gray-700 mb-2 block">
              Password
            </Label>

            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <Button
            onClick={login}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold"
          >
            {loading ? "Please wait..." : "Continue"}
          </Button>

          <div className="text-center text-sm text-gray-500 leading-6">
  New to AhIre?{" "}
  <Link
    to="/register"
    className="font-semibold text-orange-500 hover:text-orange-600"
  >
    Create Account
  </Link>
</div>
        </div>
      </Card>
    </div>
  </div>
);
}

export default Login;