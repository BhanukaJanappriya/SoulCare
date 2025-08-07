import { useState,useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DoctorRegister() {
  const [formData, setFormData] = useState({
    username: "",
    full_name:"",
    email: "",
    password: "",
    confirm_password:"",
    nic: "",
    contact_number: "",
    specialization: "",
    availability: "",
  });

  const [confirmPasswordError,setConfirmPasswordError] = useState(false)

  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (formData.confirm_password) {
      setConfirmPasswordError(formData.password !== formData.confirm_password);
    }
  }, [formData.password, formData.confirm_password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Submitting...");
    setConfirmPasswordError(false);

    if (formData.password !== formData.confirm_password) {
      setMessage("Registration failed: Passwords do not match");
      setConfirmPasswordError(true);
      return;}
    

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/register/doctor/",
        formData
      );
      setMessage("Doctor registered successfully!");
      console.log(response.data);
      navigate("/login");
    }catch (error) {
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
      <h1 className="text-2xl font-bold mb-6 text-center">Doctor Registration</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {["full_name","username", "email", "password","confirm_password", "nic", "contact_number", "specialization", "availability"].map((field) => 
        field === "confirm_password" ? (
            <div key={field}>
              <input
                type="password"
                name="confirm_password"
                placeholder="CONFIRM PASSWORD"
                value={formData.confirm_password}
                onChange={handleChange}
                className={`border w-full p-2 rounded focus:outline-none focus:ring ${
                  confirmPasswordError ? "border-red-500" : ""
                }`}
                required
              />
              {confirmPasswordError && (
                <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
              )}
            </div>
          ):
          (
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
          Register Doctor
        </button>
      </form>
      <p className="text-red-500 mt-4 text-center text-sm">{message}</p>
    </div>
  );
}

export default DoctorRegister;
