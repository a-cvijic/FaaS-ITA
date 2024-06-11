import React, { useState } from "react";
import axios from "axios";

const Register = ({ setAuthView }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/register", {
        username,
        password,
      });
      setSuccess(response.data.message);
      setError("");
    } catch (error) {
      setError("Registration failed. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
      <button onClick={() => setAuthView("login")}>
        Already have an account? Login
      </button>
    </div>
  );
};

export default Register;
