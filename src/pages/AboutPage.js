import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { usersService } from "../services/supabase";
import { supabase } from "../supabase/client";

const AboutPage = ({ user, loginUser }) => {
  const [editMode, setEditMode] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [storageLoading, setStorageLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [storageReady, setStorageReady] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [animateIn, setAnimateIn] = useState(false);

  const placeholderImage =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhZmIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gUGhvdG88L3RleHQ+Cjwvc3ZnPgo=";

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  useEffect(() => {
    if (user?.photo) {
      setImagePreview(user.photo);
    } else {
      setImagePreview(placeholderImage);
    }

    setUserDetails({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
  }, [user]);

  const testStorageUpload = useCallback(async () => {
    try {
      const testBlob = new Blob(["test"], { type: "text/plain" });
      const testFile = new File([testBlob], "test.txt");

      const { error } = await supabase.storage
        .from("profile-photos")
        .upload("storage-test.txt", testFile);

      if (!error) {
        await supabase.storage
          .from("profile-photos")
          .remove(["storage-test.txt"]);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  const setupStorageAutomatically = useCallback(async () => {
    setStorageLoading(true);
    setMessage("🛠️ Setting up storage automatically...");

    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const profileBucket = buckets.find(
        (bucket) => bucket.name === "profile-photos"
      );

      if (!profileBucket) {
        await supabase.storage.createBucket("profile-photos", {
          public: true,
          fileSizeLimit: 5242880,
        });
      }

      let success = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        setMessage(`🔄 Setup attempt ${attempt + 1}/3...`);
        success = await testStorageUpload();
        if (success) {
          setStorageReady(true);
          setMessage("✅ Storage setup successful!");
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (!success) {
        setMessage("⚠️ Storage setup incomplete. Photo uploads may not work.");
      }
    } catch (error) {
      setMessage(`❌ Setup error: ${error.message}`);
    } finally {
      setStorageLoading(false);
    }
  }, [testStorageUpload]);

  const checkAndSetupStorage = useCallback(async () => {
    const isWorking = await testStorageUpload();
    if (isWorking) {
      setStorageReady(true);
    } else {
      await setupStorageAutomatically();
    }
  }, [testStorageUpload, setupStorageAutomatically]);

  useEffect(() => {
    checkAndSetupStorage();
  }, [checkAndSetupStorage]);

  const validatePhone = (phone) => {
    if (!phone) return true;
    return /^\d{0,10}$/.test(phone);
  };

  const validateForm = () => {
    const errors = {};

    if (!userDetails.name?.trim()) {
      errors.name = "Full Name is required";
    } else if (userDetails.name.trim().length < 2) {
      errors.name = "Full Name must be at least 2 characters";
    }

    if (!userDetails.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userDetails.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (userDetails.phone && !validatePhone(userDetails.phone)) {
      errors.phone = "Phone number must contain only numbers (max 10 digits)";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid = () => {
    const nameValid = userDetails.name?.trim() && userDetails.name.trim().length >= 2;
    const emailValid = userDetails.email?.trim() && /\S+@\S+\.\S+/.test(userDetails.email);
    const phoneValid = validatePhone(userDetails.phone);
    
    return nameValid && emailValid && phoneValid;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMessage("Please select an image file");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setMessage("Image size should be less than 2MB");
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToStorage = async (file, userId) => {
    if (!storageReady) {
      await checkAndSetupStorage();
    }

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${userId}/profile_${Date.now()}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from("profile-photos")
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-photos").getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSave = async () => {
    if (!user?.id) return;

    if (!validateForm()) {
      setMessage("❌ Please fix all errors before saving");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      let photoUrl = user.photo;

      if (profileImage) {
        try {
          photoUrl = await uploadImageToStorage(profileImage, user.id);
        } catch (uploadError) {
          setMessage(`❌ Image upload failed: ${uploadError.message}`);
          setLoading(false);
          return;
        }
      }

      const updatedUserData = {
        name: userDetails.name.trim(),
        email: userDetails.email.trim(),
        phone: userDetails.phone?.trim() || "",
        address: userDetails.address?.trim() || "",
        updated_at: new Date().toISOString(),
      };

      let updatedUser;

      try {
        updatedUser = await usersService.update(user.id, updatedUserData);

        if (photoUrl && photoUrl !== user.photo) {
          try {
            const photoUpdateData = { ...updatedUserData, photo: photoUrl };
            updatedUser = await usersService.update(user.id, photoUpdateData);
          } catch (photoError) {
            console.warn("Could not save photo to database");
          }
        }
      } catch (updateError) {
        console.error("Database update failed:", updateError);
        updatedUser = { ...user, ...updatedUserData, photo: photoUrl };
      }

      const userWithPhoto = {
        ...updatedUser,
        photo: photoUrl,
        id: user.id,
      };

      if (loginUser) {
        loginUser(userWithPhoto);
      }

      localStorage.setItem("user", JSON.stringify(userWithPhoto));

      if (photoUrl) {
        setImagePreview(photoUrl);
      }

      setMessage("✅ Profile updated successfully!");
      setEditMode(false);
      setProfileImage(null);
      setFieldErrors({});
    } catch (error) {
      console.error("Save failed:", error);
      setMessage(`❌ Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      const numbersOnly = value.replace(/\D/g, "");
      const limitedNumbers = numbersOnly.slice(0, 10);
      setUserDetails((prev) => ({ ...prev, [name]: limitedNumbers }));
    } else {
      setUserDetails((prev) => ({ ...prev, [name]: value }));
    }

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneKeyPress = (e) => {
    if (!/\d/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab") {
      e.preventDefault();
    }
  };

  const resetForm = () => {
    setEditMode(false);
    setUserDetails({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setProfileImage(null);
    setImagePreview(user?.photo || placeholderImage);
    setMessage("");
    setFieldErrors({});
  };

  const getMemberSince = () => {
    if (user?.created_at) return new Date(user.created_at).toLocaleDateString();
    if (user?.updated_at) return new Date(user.updated_at).toLocaleDateString();
    return "N/A";
  };

  const hasPhoto = () => {
    return user?.photo && user.photo !== placeholderImage;
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <div className="card shadow-sm border-0 mx-auto" style={{ maxWidth: "400px" }}>
            <div className="card-body p-5">
              <div className="mb-4">
                <i className="fas fa-user-circle" style={{ fontSize: "80px", color: "#667eea" }}></i>
              </div>
              <h3 className="mb-3">Welcome Back!</h3>
              <p className="text-muted mb-4">Please log in to view your profile</p>
              <Link to="/login" className="btn btn-gradient-primary px-4 py-2">
                Login to Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`profile-container ${animateIn ? "fade-in" : ""}`}>
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
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

          .profile-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 2rem 1rem;
          }

          .fade-in {
            animation: fadeIn 0.6s ease-out;
          }

          .slide-up {
            animation: slideUp 0.5s ease-out;
          }

          .profile-card {
            background: white;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
          }

          .profile-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
          }

          .btn-gradient-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            transition: all 0.3s ease;
          }

          .btn-gradient-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            color: white;
          }

          .btn-gradient-primary:disabled {
            opacity: 0.6;
            transform: none;
          }

          .btn-outline-gradient {
            background: transparent;
            border: 2px solid #667eea;
            color: #667eea;
            transition: all 0.3s ease;
          }

          .btn-outline-gradient:hover {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-color: transparent;
            color: white;
            transform: translateY(-2px);
          }

          .profile-image {
            width: 150px;
            height: 150px;
            object-fit: cover;
            border: 4px solid white;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
          }

          .profile-image:hover {
            transform: scale(1.05);
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
          }

          .stat-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 16px;
            padding: 1rem;
            text-align: center;
            transition: all 0.3s ease;
          }

          .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          }

          .form-control-custom {
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 12px 16px;
            transition: all 0.3s ease;
            font-size: 16px;
          }

          .form-control-custom:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
            outline: none;
          }

          .form-control-custom.is-invalid {
            border-color: #dc3545;
          }

          .input-group-icon {
            position: relative;
          }

          .input-group-icon i {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
          }

          .input-group-icon input {
            padding-left: 42px;
          }

          .badge-status {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }

          @media (max-width: 768px) {
            .profile-container {
              padding: 1rem;
            }
            
            .profile-card {
              margin-bottom: 1rem;
            }
            
            .profile-image {
              width: 120px;
              height: 120px;
            }
          }

          @media (max-width: 576px) {
            .profile-image {
              width: 100px;
              height: 100px;
            }
            
            .btn-gradient-primary,
            .btn-outline-gradient {
              padding: 10px 20px;
              font-size: 14px;
            }
          }
        `}
      </style>

      <div className="container">
        {/* Header Section */}
        <div className="text-center mb-5 slide-up">
          <h1 style={{ 
            fontSize: "clamp(2rem, 5vw, 2.5rem)",
            fontWeight: 700,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: "0.5rem"
          }}>
            My Profile
          </h1>
          <p className="text-muted" style={{ fontSize: "clamp(0.9rem, 3vw, 1.1rem)" }}>
            Manage your account information and preferences
          </p>
        </div>

        {/* Storage Status */}
        <div className="mb-4 text-center slide-up">
          <button
            className="btn btn-sm btn-outline-secondary me-2"
            onClick={checkAndSetupStorage}
            disabled={storageLoading}
            style={{ borderRadius: "20px" }}
          >
            {storageLoading ? "🔄 Setting Up..." : "🔧 Check Storage"}
          </button>
          <span className={`badge ${storageReady ? "bg-success" : "bg-warning"} px-3 py-2`}>
            {storageReady ? "✅ Storage Ready" : "🔄 Check Storage"}
          </span>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`alert ${message.includes("❌") ? "alert-danger" : message.includes("✅") ? "alert-success" : "alert-warning"} slide-up`} style={{ borderRadius: "16px", animation: "slideUp 0.3s ease-out" }}>
            <i className={`fas ${message.includes("❌") ? "fa-exclamation-circle" : message.includes("✅") ? "fa-check-circle" : "fa-info-circle"} me-2`}></i>
            {message}
          </div>
        )}

        <div className="row g-4">
          {/* Left Column - Profile Photo & Stats */}
          <div className="col-lg-4">
            <div className="profile-card slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="card-body text-center p-4">
                <div className="position-relative d-inline-block mb-3">
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="rounded-circle profile-image"
                    onError={(e) => (e.target.src = placeholderImage)}
                  />
                  {editMode && (
                    <div className="position-absolute bottom-0 end-0">
                      <label
                        htmlFor="profileImage"
                        className="btn btn-sm btn-gradient-primary rounded-circle"
                        style={{ width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <i className="fas fa-camera"></i>
                      </label>
                      <input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                      />
                    </div>
                  )}
                </div>
                
                <h4 className="mb-1">{user.name}</h4>
                <p className="text-muted mb-3">{user.email}</p>
                
                <div className="mb-3">
                  <span className={`badge-status ${hasPhoto() ? "bg-success" : "bg-warning"} text-white`}>
                    <i className={`fas ${hasPhoto() ? "fa-check" : "fa-clock"} me-1`}></i>
                    {hasPhoto() ? "Photo Set" : "Photo Not Set"}
                  </span>
                </div>
                
                {!editMode && (
                  <button
                    className="btn btn-gradient-primary w-100"
                    onClick={() => setEditMode(true)}
                    disabled={loading}
                  >
                    <i className="fas fa-edit me-2"></i>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Account Statistics */}
            <div className="profile-card mt-4 slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="card-header bg-white border-0 pt-4 px-4">
                <h5 className="mb-0">
                  <i className="fas fa-chart-line me-2" style={{ color: "#667eea" }}></i>
                  Account Statistics
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="stat-card mb-3">
                  <i className="fas fa-calendar-alt mb-2" style={{ fontSize: "24px", color: "#667eea" }}></i>
                  <div>
                    <small className="text-muted d-block">Member Since</small>
                    <strong>{getMemberSince()}</strong>
                  </div>
                </div>
                <div className="stat-card mb-3">
                  <i className="fas fa-user-tag mb-2" style={{ fontSize: "24px", color: "#f093fb" }}></i>
                  <div>
                    <small className="text-muted d-block">Account Type</small>
                    <strong className="text-capitalize">{user.role || "Customer"}</strong>
                  </div>
                </div>
                <div className="stat-card">
                  <i className="fas fa-circle mb-2" style={{ fontSize: "24px", color: "#4facfe" }}></i>
                  <div>
                    <small className="text-muted d-block">Status</small>
                    <strong className="text-success">Active</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Personal Information */}
          <div className="col-lg-8">
            <div className="profile-card slide-up" style={{ animationDelay: "0.15s" }}>
              <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center p-4">
                <h5 className="mb-0">
                  <i className="fas fa-user-circle me-2" style={{ color: "#667eea" }}></i>
                  Personal Information
                </h5>
                {editMode && (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-gradient-primary btn-sm"
                      onClick={handleSave}
                      disabled={loading || !storageReady || !isFormValid()}
                    >
                      {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Saving...</> : <><i className="fas fa-save me-2"></i>Save</>}
                    </button>
                    <button
                      className="btn btn-outline-gradient btn-sm"
                      onClick={resetForm}
                    >
                      <i className="fas fa-times me-2"></i>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-user me-2 text-primary"></i>
                      Full Name *
                    </label>
                    {editMode ? (
                      <div className="input-group-icon">
                        <i className="fas fa-user"></i>
                        <input
                          type="text"
                          className={`form-control form-control-custom ${fieldErrors.name ? "is-invalid" : ""}`}
                          name="name"
                          value={userDetails.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                        />
                        {fieldErrors.name && (
                          <div className="invalid-feedback">{fieldErrors.name}</div>
                        )}
                      </div>
                    ) : (
                      <p className="form-control-plaintext fw-medium">{user.name}</p>
                    )}
                  </div>
                  
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      Email *
                    </label>
                    {editMode ? (
                      <div className="input-group-icon">
                        <i className="fas fa-envelope"></i>
                        <input
                          type="email"
                          className={`form-control form-control-custom ${fieldErrors.email ? "is-invalid" : ""}`}
                          name="email"
                          value={userDetails.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                        />
                        {fieldErrors.email && (
                          <div className="invalid-feedback">{fieldErrors.email}</div>
                        )}
                      </div>
                    ) : (
                      <p className="form-control-plaintext fw-medium">{user.email}</p>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-phone me-2 text-primary"></i>
                      Phone Number
                    </label>
                    {editMode ? (
                      <div className="input-group-icon">
                        <i className="fas fa-phone"></i>
                        <input
                          type="tel"
                          className={`form-control form-control-custom ${fieldErrors.phone ? "is-invalid" : ""}`}
                          name="phone"
                          value={userDetails.phone}
                          onChange={handleChange}
                          onKeyPress={handlePhoneKeyPress}
                          placeholder="Enter 10-digit phone number"
                          maxLength={10}
                          inputMode="numeric"
                        />
                        {fieldErrors.phone && (
                          <div className="invalid-feedback">{fieldErrors.phone}</div>
                        )}
                        {userDetails.phone && (
                          <div className="form-text text-muted">
                            {10 - userDetails.phone.length} digits remaining
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="form-control-plaintext fw-medium">
                        {user.phone || <span className="text-muted">Not provided</span>}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                      Address
                    </label>
                    {editMode ? (
                      <textarea
                        className="form-control form-control-custom"
                        name="address"
                        rows="2"
                        value={userDetails.address}
                        onChange={handleChange}
                        placeholder="Enter your address"
                        style={{ resize: "vertical" }}
                      />
                    ) : (
                      <p className="form-control-plaintext fw-medium">
                        {user.address || <span className="text-muted">Not provided</span>}
                      </p>
                    )}
                  </div>
                </div>

                {editMode && (
                  <div className="mt-3 p-3 bg-light rounded-3">
                    <p className="text-muted small mb-0">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Note:</strong> Fields marked with * are required. Phone must contain only numbers (max 10 digits).
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;