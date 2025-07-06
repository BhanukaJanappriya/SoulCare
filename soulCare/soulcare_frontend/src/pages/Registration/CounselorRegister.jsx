import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CounselorRegister() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    nic: "",
    contact_number: "",
    expertise: "",
  });

  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Submitting...");
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/register/counselor/",
        formData
      );
      setMessage("Counselor registered successfully!");
      console.log(response.data);
      navigate("/login");
    } catch (error) {
    console.error(error.response);

    const errors = error.response?.data;
    if (errors && typeof errors === "object") {
      // Collect all field-specific errors into a single readable string
      const messages = Object.entries(errors)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
        .join(" | ");
      setMessage("Registration failed: " + messages);
    } else {
      setMessage("Registration failed: Unknown error occurred");
    }
  }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white shadow mt-10 rounded">
      <h1 className="text-2xl font-bold mb-6 text-center">Counselor Registration</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {["username", "email", "password", "nic", "contact_number", "expertise"].map((field) => (
          <input
            key={field}
            type={field === "password" ? "password" : "text"}
            name={field}
            placeholder={field.replace("_", " ").toUpperCase()}
            value={formData[field]}
            onChange={handleChange}
            className="border w-full p-2 rounded focus:outline-none focus:ring"
            required
          />
        ))}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Register Counselor
        </button>
      </form>
      <p className="mt-4 text-center text-sm">{message}</p>
    </div>
  );
}

export default CounselorRegister;
