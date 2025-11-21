// src/components/Login.jsx
import { useContext, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../AuthProvider"; // import the context object
import { Button } from "./Button";

export const Login = () => {
  const { isLoggedIn, setIsloggedIn } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors("");

    if (!username || !password) {
      setErrors("Please enter username and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/token/",
        { username, password }
      );

      const { access, refresh } = response.data;

      // Save tokens (you can change storage approach if desired)
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // Set default header for future axios requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      // Update global auth state
      setIsloggedIn(true);

      // Clear fields and navigate
      setUsername("");
      setPassword("");
      navigate("/dashboard");
    } catch (err) {
      console.error(err?.response?.data || err.message);
      // DRF returns detail for auth errors, fallback to generic message
      setErrors(err?.response?.data?.detail || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 bg-light-dark p-5 rounded">
          <h3 className="text-light text-center mb-4">Login</h3>

          {errors && <div className="alert alert-danger">{errors}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <input
                name="username"
                type="text"
                className="form-control"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="mb-3">
              <input
                name="password"
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="text-center">
              {loading ? (
                <button className="btn btn-info" type="button" disabled>
                  <FontAwesomeIcon icon={faSpinner} spin /> Please wait...
                </button>
              ) : (
                <button className="btn btn-info" type="submit">
                  Login
                </button>
              )}
            </div>
          </form>

          <div className="text-center mt-3">
            <span className="text-light">Don't have an account? </span>
            <Link to="/register" className="text-info ms-2">
              Register
            </Link>
          </div>

          {/* Optional quick logout/login UI for dev: */}
          <div className="mt-3 d-flex justify-content-between">
            <div>
              {isLoggedIn ? (
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    // quick logout helper during development
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    delete axios.defaults.headers.common["Authorization"];
                    setIsloggedIn(false);
                  }}
                >
                  Logout
                </button>
              ) : null}
            </div>
           
          </div>
        </div>
      </div>
    </div>
  );
};
