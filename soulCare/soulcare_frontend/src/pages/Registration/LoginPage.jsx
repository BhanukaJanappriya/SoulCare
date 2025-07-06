import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/login/",
        formData
      );
      console.log(response.data);
      setMessage("Login successful!");
    } catch(error){
       console.error(error.response);

       const errors = error.response?.data;

       if(errors?.non_field_errors) {
        setMessage("Login failed: "+errors.non_field_errors.join(", "))

       } else if(errors?.detail){
        setMessage("Login failed: " + errors.detail);

       } else {
        setMessage("Login failed: Unknown error occurred");

       }
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white shadow mt-10 rounded">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="USERNAME"
          value={formData.username}
          onChange={handleChange}
          className="border w-full p-2 rounded focus:outline-none focus:ring"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="PASSWORD"
          value={formData.password}
          onChange={handleChange}
          className="border w-full p-2 rounded focus:outline-none focus:ring"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-center text-sm">{message}</p>
    </div>
  );
}

export default LoginPage;
