import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../Services/authService";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      await loginUser(email, password);

      navigate("/siridigitals/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="siri-login-page">
      <div className="siri-login-card">
        {/* Logo / Shop Name */}
        <div className="siri-login-header">
          <h1>Siri Digitals</h1>

          <p>Flex Printing Shop Management</p>
        </div>

        {/* Login Form */}
        <form className="siri-login-form" onSubmit={handleLogin}>
          <div className="siri-form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="siri-form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {/* Error */}
          {error && <div className="siri-login-error">{error}</div>}

          {/* Login Button */}
          <button
            type="submit"
            className="siri-login-button"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="siri-login-footer">
          <p>Siri Digitals</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
