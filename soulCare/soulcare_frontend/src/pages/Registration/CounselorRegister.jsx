import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CounselorRegister() {
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    nic: "",
    contact_number: "",
    expertise: "",
  });

  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  // Live password-match check
  useEffect(() => {
    if (formData.confirm_password) {
      setConfirmPasswordError(formData.password !== formData.confirm_password);
    }
  }, [formData.password, formData.confirm_password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Submitting...");
    setConfirmPasswordError(false);

    if (formData.password !== formData.confirm_password) {
      setMessage("Registration failed: Passwords do not match");
      setConfirmPasswordError(true);
      return;
    }

    try {
      // strip confirm_password from the payload
      const { confirm_password, ...payload } = formData;
      const response = await axios.post(
        "http://localhost:8000/api/auth/register/counselor/",
        payload
      );
      setMessage("Counselor registered successfully!");
      console.log(response.data);
      navigate("/login");
    } catch (error) {
      console.error(error.response);
      const errors = error.response?.data;
      if (errors && typeof errors === "object") {
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
        {[
          "full_name",
          "username",
          "email",
          "password",
          "confirm_password",
          "nic",
          "contact_number",
          "expertise",
        ].map((field) =>
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
          ) : (
            <input
              key={field}
              type={
                field === "password"
                  ? "password"
                  : field === "email"
                  ? "email"
                  : field === "contact_number"
                  ? "tel"
                  : "text"
              }
              name={field}
              placeholder={field.replace("_", " ").toUpperCase()}
              value={formData[field]}
              onChange={handleChange}
              className="border w-full p-2 rounded focus:outline-none focus:ring"
              required
            />
          )
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Register Counselor
        </button>
      </form>
      <p className="text-red-500 mt-4 text-center text-sm">{message}</p>
    </div>
  );
}

export default CounselorRegister;
