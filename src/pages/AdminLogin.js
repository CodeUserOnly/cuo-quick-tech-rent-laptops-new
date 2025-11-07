import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usersService } from '../services/supabase';

const AdminLogin = ({ loginUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = await usersService.login(formData.email, formData.password);
      
      if (user && user.role === 'admin') {
        loginUser(user);
        navigate('/admin');
      } else {
        setError('Admin access required');
      }
    } catch (error) {
      setError('Login failed');
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="text-center mb-4">Admin Login</h2>
              
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address"
                    required 
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter password"
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Login as Admin
                </button>
              </form>

              <hr className="my-4" />

              <div className="text-center mt-3">
                <p>Create a new admin account here: <Link to="/admin/signup">Admin Signup</Link></p>
                <p>Are you a regular user? <Link to="/login">User Login</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;