import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usersService } from "../services/supabase";

const AdminSignup = ({ loginUser }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    adminKey: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const validAdminKey = process.env.REACT_APP_ADMIN_KEY || "ADMIN123";
    if (formData.adminKey !== validAdminKey) {
      setError("Invalid admin key");
      setLoading(false);
      return;
    }

    try {
      const existingUser = await usersService.getByEmail(formData.email);
      if (existingUser) {
        setError("Admin with this email already exists");
        setLoading(false);
        return;
      }

      const newAdmin = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        role: "admin",
      };

      const adminUser = await usersService.create(newAdmin);
      loginUser(adminUser);
      navigate("/admin");
    } catch (error) {
      console.error("Admin signup error:", error);
      setError(
        `Failed to create admin account: ${
          error.message || "Please try again."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="auth-form">
            <h2 className="text-center mb-4">Admin Sign Up</h2>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  maxLength={10}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <textarea
                  className="form-control"
                  id="address"
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}"
                  title="Must contain at least one number and one uppercase and lowercase letter, and at least 6 or more characters"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Enter confirm password"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="adminKey" className="form-label">
                  Admin Key
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="adminKey"
                  name="adminKey"
                  value={formData.adminKey}
                  onChange={handleChange}
                  placeholder="Enter admin authorization key"
                  required
                />
                <div className="form-text">
                  You need an admin authorization key to create an admin
                  account.
                </div>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="terms"
                  required
                />
                <label className="form-check-label" htmlFor="terms">
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Creating Admin Account..."
                    : "Create Admin Account"}
                </button>
              </div>
            </form>

            <hr className="my-4" />

            <div className="text-center">
              <p>
                Already have an admin account?{" "}
                <Link to="/admin/login">Login here</Link>
              </p>
              <p>
                Are you a regular user? <Link to="/signup">User sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
