import { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});      // object, not string
  const [success, setSuccess] = useState(false); // spelled correctly
  const [loading, setLoading] = useState(false);

  const handleRegistration = async (e) => {
    e.preventDefault();

    // Basic client-side validation (optional but helpful)
    if (!username || !email || !password) {
      setErrors({ non_field_errors: ["All fields are required."] });
      return;
    }

    setLoading(true);
    setErrors({}); // clear previous errors
    setSuccess(false);

    const userData = { username, email, password };

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/register/",
        userData
      );

      console.log("Register data ==>", response.data);
      setSuccess(true);
      setErrors({});
      // Optionally clear form fields
      setUsername("");
      setEmail("");
      setPassword("");

      // Optionally hide success after a few seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      // Handle both HTTP error responses and network errors
      const serverData = error.response?.data;
      if (serverData) {
        // If server returns object of field errors like { username: [...], password: [...] }
        setErrors(serverData);
        console.log("Server validation errors:", serverData);
      } else {
        // Network or other error
        setErrors({ non_field_errors: [error.message || "Registration failed"] });
        console.error("Registration error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 bg-light-dark p-5 rounded">
          <h3 className="text-light text-center mb-4">Create an account</h3>

          {/* Non-field errors */}
          {errors?.non_field_errors && (
            <div className="alert alert-danger">
              {errors.non_field_errors.map((msg, i) => (
                <div key={i}>{msg}</div>
              ))}
            </div>
          )}

          {/* Success */}
          {success && <div className="alert alert-success">Registration Successful</div>}

          <form onSubmit={handleRegistration}>
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
              {/* Field error */}
              {errors?.username && (
                <small className="text-danger">{errors.username[0]}</small>
              )}
            </div>

            <div className="mb-3">
              <input
                name="email"
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {errors?.email && <small className="text-danger">{errors.email[0]}</small>}
            </div>

            <div className="mb-3">
              <input
                name="password"
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              {errors?.password && (
                <small className="text-danger">{errors.password[0]}</small>
              )}
            </div>

            <div className="text-center">
              {loading ? (
                <button className="btn btn-info" type="button" disabled>
                  <FontAwesomeIcon icon={faSpinner} spin /> Please wait...
                </button>
              ) : (
                <button className="btn btn-info" type="submit">
                  Register
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
