import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usersService } from "../services/supabase";

const UserSignup = ({ loginUser }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle phone number - only allow numbers
    if (name === 'phone') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      if (numbersOnly.length <= 10) {
        setFormData((prev) => ({
          ...prev,
          [name]: numbersOnly,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error when user starts typing
    if (error) setError("");
    
    // Check password strength
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return '#e53e3e';
    if (passwordStrength === 3) return '#ed8936';
    if (passwordStrength === 4) return '#48bb78';
    return '#38a169';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength === 3) return 'Fair';
    if (passwordStrength === 4) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.address) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Validate email format
    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address (e.g., name@example.com)");
      setLoading(false);
      return;
    }

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

    // Validate phone number - exactly 10 digits
    if (formData.phone.length !== 10) {
      setError("Phone number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    try {
      // Check if user already exists
      const existingUser = await usersService.getByEmail(formData.email);
      if (existingUser) {
        setError("User with this email already exists");
        setLoading(false);
        return;
      }

      // Create new user
      const newUser = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        role: "customer",
      };

      const user = await usersService.create(newUser);
      loginUser(user);
      
      // Check if there's a redirect path
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add styles to document
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-tap-highlight-color: transparent;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes shimmer {
        0% {
          background-position: -1000px 0;
        }
        100% {
          background-position: 1000px 0;
        }
      }

      /* Prevent zoom on input focus for Android */
      input[type="email"],
      input[type="password"],
      input[type="text"],
      input[type="tel"],
      textarea {
        font-size: 16px !important;
      }

      /* Remove spinner buttons from number input */
      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      input[type="number"] {
        -moz-appearance: textfield;
      }

      /* Smooth scrolling */
      .signup-container {
        -webkit-overflow-scrolling: touch;
      }

      /* Active state for touch feedback */
      .touch-feedback:active {
        transform: scale(0.98);
        transition: transform 0.1s ease;
      }

      /* Input focus effects */
      .input-focus-effect:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      /* Loading animation */
      .loading-spinner {
        animation: spin 1s linear infinite;
      }

      /* Password strength animation */
      .strength-bar {
        transition: all 0.3s ease;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Styles based on device
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: isMobile ? '16px' : '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    card: {
      maxWidth: isMobile ? '100%' : '550px',
      width: '100%',
      background: 'white',
      borderRadius: isMobile ? '20px' : '24px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      overflow: 'hidden',
      animation: 'fadeIn 0.5s ease-out'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: isMobile ? '32px 24px' : '40px 32px',
      textAlign: 'center',
      color: 'white'
    },
    iconWrapper: {
      width: isMobile ? '70px' : '80px',
      height: isMobile ? '70px' : '80px',
      margin: '0 auto 16px',
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'slideIn 0.5s ease-out'
    },
    title: {
      fontSize: isMobile ? '28px' : '32px',
      fontWeight: '700',
      margin: '0 0 8px 0',
      color: 'white'
    },
    subtitle: {
      fontSize: isMobile ? '14px' : '16px',
      opacity: 0.9,
      margin: 0,
      color: 'white'
    },
    body: {
      padding: isMobile ? '24px' : '32px',
      maxHeight: isMobile ? 'calc(100vh - 200px)' : 'auto',
      overflowY: isMobile ? 'auto' : 'visible'
    },
    errorAlert: {
      background: '#fed7d7',
      color: '#c53030',
      padding: '12px 16px',
      borderRadius: '12px',
      marginBottom: '20px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      animation: 'fadeIn 0.3s ease-out'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '8px'
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    input: {
      width: '100%',
      padding: isMobile ? '14px 16px' : '12px 16px',
      fontSize: '16px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      backgroundColor: 'white',
      outline: 'none'
    },
    textarea: {
      width: '100%',
      padding: isMobile ? '14px 16px' : '12px 16px',
      fontSize: '16px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      backgroundColor: 'white',
      outline: 'none',
      fontFamily: 'inherit',
      resize: 'vertical'
    },
    passwordToggle: {
      position: 'absolute',
      right: '12px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#a0aec0'
    },
    passwordStrength: {
      marginTop: '8px'
    },
    strengthBar: {
      height: '4px',
      background: '#e2e8f0',
      borderRadius: '2px',
      overflow: 'hidden',
      marginBottom: '4px'
    },
    strengthFill: {
      height: '100%',
      width: `${(passwordStrength / 5) * 100}%`,
      background: getPasswordStrengthColor(),
      transition: 'all 0.3s ease',
      borderRadius: '2px'
    },
    strengthText: {
      fontSize: '11px',
      color: getPasswordStrengthColor(),
      fontWeight: '500'
    },
    signupBtn: {
      width: '100%',
      padding: isMobile ? '14px' : '12px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: isMobile ? '16px' : '18px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    divider: {
      margin: '24px 0',
      position: 'relative',
      textAlign: 'center'
    },
    dividerLine: {
      height: '1px',
      background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0
    },
    dividerText: {
      background: 'white',
      padding: '0 12px',
      position: 'relative',
      color: '#a0aec0',
      fontSize: '14px'
    },
    footer: {
      textAlign: 'center',
      marginTop: '24px'
    },
    footerText: {
      color: '#4a5568',
      fontSize: '14px',
      marginBottom: '12px'
    },
    footerLink: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'color 0.2s ease'
    }
  };

  // Icons
  const Icon = ({ name, size = 20, color = 'currentColor' }) => {
    const icons = {
      user: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21M16 7C16 9.2 14.2 11 12 11C9.8 11 8 9.2 8 7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7Z" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      email: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8L12 13L21 8M3 8H21M3 8V16C3 16.5304 3.21071 17.0391 3.58579 17.4142C3.96086 17.7893 4.46957 18 5 18H19C19.5304 18 20.0391 17.7893 20.4142 17.4142C20.7893 17.0391 21 16.5304 21 16V8M3 8L3 6C3 5.46957 3.21071 4.96086 3.58579 4.58579C3.96086 4.21071 4.46957 4 5 4H19C19.5304 4 20.0391 4.21071 20.4142 4.58579C20.7893 4.96086 21 5.46957 21 6V8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      phone: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 16.9V19C22 19.6 21.6 20.1 21 20.2C19.6 20.4 18.2 20.3 16.9 19.9C16.4 19.8 16 19.3 16 18.8V15.6C16 15.1 16.4 14.6 16.9 14.5C18 14.2 19.2 14 20.4 14H21.3C21.7 14 22 14.3 22 14.7V16.9Z" stroke={color} strokeWidth="1.5"/>
          <path d="M8 2H5.1C4.7 2 4.4 2.3 4.3 2.7C4.1 4.1 4 5.5 4.1 6.9C4.2 7.4 4.6 7.9 5.1 8H8.3C8.8 8 9.2 7.6 9.3 7.1C9.5 6 9.6 4.9 9.5 3.8C9.5 3.3 9.1 2.9 8.6 2.8C8.4 2.8 8.2 2.8 8 2.8V2Z" stroke={color} strokeWidth="1.5"/>
          <path d="M8 2V8M8 16H5.1C4.7 16 4.4 15.7 4.3 15.3C4.1 13.9 4 12.5 4.1 11.1C4.2 10.6 4.6 10.1 5.1 10H8.3C8.8 10 9.2 10.4 9.3 10.9C9.5 12 9.6 13.1 9.5 14.2C9.5 14.7 9.1 15.1 8.6 15.2C8.4 15.2 8.2 15.2 8 15.2V16Z" stroke={color} strokeWidth="1.5"/>
        </svg>
      ),
      address: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.1 2 5 5.1 5 9C5 13.2 12 22 12 22C12 22 19 13.2 19 9C19 5.1 15.9 2 12 2Z" stroke={color} strokeWidth="1.5"/>
          <circle cx="12" cy="9" r="3" stroke={color} strokeWidth="1.5"/>
        </svg>
      ),
      lock: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L3 7L12 12L21 7L12 2ZM12 12V21.5M12 12L3 7M12 12L21 7M12 21.5L3 16.5V9.5M12 21.5L21 16.5V9.5" stroke={color} strokeWidth="1.5"/>
          <path d="M16 12L12 14L8 12M12 14V18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      eye: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="1.5"/>
          <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5"/>
        </svg>
      ),
      eyeOff: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2L22 22M9.9 4.24C10.6 4.09 11.3 4 12 4C19 4 23 12 23 12C22.5 13 21.8 14 20.9 14.9M6.5 6.5C4.2 8.2 2.5 11 2 12C2 12 6 20 12 20C13.3 20 14.5 19.7 15.6 19.1M12 8C12.8 8 13.5 8.3 14 8.8C14.5 9.3 14.8 10 14.8 10.8M8 12C8 13.1 8.9 14 10 14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      spinner: (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="loading-spinner">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round"/>
          <path d="M12 2 L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    };
    return icons[name] || null;
  };

  return (
    <div style={styles.container} className="signup-container">
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <Icon name="user" size={isMobile ? 32 : 36} color="white" />
          </div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join us and start renting laptops</p>
        </div>

        <div style={styles.body}>
          {error && (
            <div style={styles.errorAlert}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrapper}>
                <input
                  type="text"
                  style={styles.input}
                  className="input-focus-effect"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <input
                  type="email"
                  style={styles.input}
                  className="input-focus-effect"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email (e.g., name@example.com)"
                  required
                  disabled={loading}
                />
              </div>
              <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '4px' }}>
                Must be a valid email format (e.g., name@domain.com)
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <div style={styles.inputWrapper}>
                <input
                  type="tel"
                  style={styles.input}
                  className="input-focus-effect"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="Enter 10-digit mobile number"
                  required
                  disabled={loading}
                />
              </div>
              <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '4px' }}>
                Only numbers allowed (10 digits)
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Address</label>
              <div style={styles.inputWrapper}>
                <textarea
                  style={styles.textarea}
                  className="input-focus-effect"
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your full address"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  style={styles.input}
                  className="input-focus-effect"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  className="touch-feedback"
                >
                  <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
                </button>
              </div>
              {formData.password && (
                <div style={styles.passwordStrength}>
                  <div style={styles.strengthBar}>
                    <div style={styles.strengthFill} className="strength-bar" />
                  </div>
                  <span style={styles.strengthText}>
                    Password strength: {getPasswordStrengthText()}
                  </span>
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '4px' }}>
                Must be at least 6 characters with uppercase, lowercase, and numbers
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrapper}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  style={styles.input}
                  className="input-focus-effect"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="touch-feedback"
                >
                  <Icon name={showConfirmPassword ? "eyeOff" : "eye"} size={18} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={styles.signupBtn}
              className="touch-feedback"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon name="spinner" size={18} color="white" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                </>
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>Already have an account?</span>
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              <Link to="/login" style={styles.footerLink} className="touch-feedback">
                Sign in to your account
              </Link>
            </p>
            <p style={styles.footerText}>
              Are you an admin?{" "}
              <Link to="/admin/login" style={styles.footerLink} className="touch-feedback">
                Admin Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;