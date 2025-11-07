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

  const placeholderImage =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZGVlMmU2Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNmM3NTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gUGhvdG88L3RleHQ+Cjwvc3ZnPgo=";

  // Update local state when user prop changes
  useEffect(() => {
    console.log("👤 User prop updated:", user);
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

  // Simple storage test
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

  // Automatic storage setup
  const setupStorageAutomatically = useCallback(async () => {
    setStorageLoading(true);
    setMessage("🛠️ Setting up storage automatically...");

    try {
      // Ensure bucket exists
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

      // Try multiple upload attempts
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

  // Main storage setup function
  const checkAndSetupStorage = useCallback(async () => {
    const isWorking = await testStorageUpload();
    if (isWorking) {
      setStorageReady(true);
    } else {
      await setupStorageAutomatically();
    }
  }, [testStorageUpload, setupStorageAutomatically]);

  // Check and setup storage automatically on component mount
  useEffect(() => {
    checkAndSetupStorage();
  }, [checkAndSetupStorage]);

  // Phone number validation - only numbers
  const validatePhone = (phone) => {
    // Allow empty phone (optional field)
    if (!phone) return true;
    
    // Only numbers allowed, 10 digits maximum
    return /^\d{0,10}$/.test(phone);
  };

  // Validate required fields
  const validateForm = () => {
    const errors = {};

    // Full Name validation - REQUIRED
    if (!userDetails.name?.trim()) {
      errors.name = "Full Name is required";
    } else if (userDetails.name.trim().length < 2) {
      errors.name = "Full Name must be at least 2 characters";
    }

    // Email validation - REQUIRED
    if (!userDetails.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userDetails.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation - NUMBERS ONLY
    if (userDetails.phone && !validatePhone(userDetails.phone)) {
      errors.phone = "Phone number must contain only numbers (max 10 digits)";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if form is valid for enabling save button
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

    // Validate form before saving - BOTH FIELDS REQUIRED
    if (!validateForm()) {
      setMessage("❌ Please fix all errors before saving");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      let photoUrl = user.photo;

      // Upload new image if selected
      if (profileImage) {
        try {
          photoUrl = await uploadImageToStorage(profileImage, user.id);
          console.log("📸 Photo uploaded:", photoUrl);
        } catch (uploadError) {
          setMessage(`❌ Image upload failed: ${uploadError.message}`);
          setLoading(false);
          return;
        }
      }

      // Prepare update data
      const updatedUserData = {
        name: userDetails.name.trim(),
        email: userDetails.email.trim(),
        phone: userDetails.phone?.trim() || "",
        address: userDetails.address?.trim() || "",
        updated_at: new Date().toISOString(),
      };

      let updatedUser;

      try {
        // Update user in database
        updatedUser = await usersService.update(user.id, updatedUserData);

        // If we have a new photo, update the photo field
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

      // Create the complete updated user object
      const userWithPhoto = {
        ...updatedUser,
        photo: photoUrl,
        id: user.id,
      };

      console.log("👤 Updated user object:", userWithPhoto);

      // CRITICAL: Update parent component state
      if (loginUser) {
        console.log("🔄 Calling loginUser to update App.js state");
        loginUser(userWithPhoto);
      }

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(userWithPhoto));

      // Update local image preview
      if (photoUrl) {
        setImagePreview(photoUrl);
      }

      setMessage(
        "✅ Profile updated successfully!" +
          (profileImage ? " Photo uploaded." : "")
      );
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
    
    // Special handling for phone field - only allow numbers
    if (name === "phone") {
      // Remove any non-digit characters
      const numbersOnly = value.replace(/\D/g, "");
      // Limit to 10 digits
      const limitedNumbers = numbersOnly.slice(0, 10);
      
      setUserDetails((prev) => ({ ...prev, [name]: limitedNumbers }));
    } else {
      setUserDetails((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneKeyPress = (e) => {
    // Prevent non-numeric characters from being entered
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
      <div className="container mt-4">
        <div className="alert alert-warning text-center">
          <h4>Please log in to view your profile</h4>
          <Link to="/login" className="btn btn-primary mt-3">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-12">
          <h1>My Profile</h1>
          <p className="lead">
            Manage your account information and preferences
          </p>

          <div className="mb-3">
            <button
              className="btn btn-sm btn-outline-info me-2"
              onClick={checkAndSetupStorage}
              disabled={storageLoading}
            >
              {storageLoading ? "🔄 Setting Up..." : "🧪 Check Storage"}
            </button>
            <span
              className={`badge ${storageReady ? "bg-success" : "bg-warning"}`}
            >
              {storageReady ? "✅ Storage Ready" : "🔄 Check Storage"}
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`alert ${
            message.includes("❌")
              ? "alert-danger"
              : message.includes("✅")
              ? "alert-success"
              : "alert-warning"
          }`}
        >
          {message}
        </div>
      )}

      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <div className="mb-3">
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="rounded-circle"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    border: "3px solid #dee2e6",
                  }}
                  onError={(e) => (e.target.src = placeholderImage)}
                />
                {editMode && (
                  <div className="mt-2">
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor="profileImage"
                      className="btn btn-outline-secondary btn-sm"
                    >
                      📷 Change Photo
                    </label>
                    {profileImage && (
                      <p className="small text-muted mt-1">
                        {profileImage.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <h4>{user.name}</h4>
              <p className="text-muted">{user.email}</p>
              <p
                className={`small ${
                  hasPhoto() ? "text-success" : "text-warning"
                }`}
              >
                📸 {hasPhoto() ? "Photo: Set" : "Photo: Not set"}
              </p>
              {!editMode && (
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setEditMode(true)}
                  disabled={loading}
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-header">
              <h5>Account Statistics</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Member Since:</strong>
                <br />
                {getMemberSince()}
              </div>
              <div className="mb-3">
                <strong>Account Type:</strong>
                <br />
                <span className="badge bg-info">{user.role || "Customer"}</span>
              </div>
              <div>
                <strong>Status:</strong>
                <br />
                <span className="badge bg-success">Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Personal Information</h5>
              {editMode && (
                <div>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={handleSave}
                    disabled={loading || !storageReady || !isFormValid()}
                  >
                    {loading ? "💾 Saving..." : "💾 Save Changes"}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={resetForm}
                  >
                    ❌ Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name *</label>
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        className={`form-control ${
                          fieldErrors.name ? "is-invalid" : ""
                        }`}
                        name="name"
                        value={userDetails.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                      />
                      {fieldErrors.name && (
                        <div className="invalid-feedback">
                          {fieldErrors.name}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="form-control-plaintext">{user.name}</p>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email *</label>
                  {editMode ? (
                    <>
                      <input
                        type="email"
                        className={`form-control ${
                          fieldErrors.email ? "is-invalid" : ""
                        }`}
                        name="email"
                        value={userDetails.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        required
                      />
                      {fieldErrors.email && (
                        <div className="invalid-feedback">
                          {fieldErrors.email}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="form-control-plaintext">{user.email}</p>
                  )}
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone</label>
                  {editMode ? (
                    <>
                      <input
                        type="tel"
                        className={`form-control ${
                          fieldErrors.phone ? "is-invalid" : ""
                        }`}
                        name="phone"
                        value={userDetails.phone}
                        onChange={handleChange}
                        onKeyPress={handlePhoneKeyPress}
                        placeholder="Enter 10-digit phone number"
                        maxLength={10}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                      {fieldErrors.phone && (
                        <div className="invalid-feedback">
                          {fieldErrors.phone}
                        </div>
                      )}
                      {userDetails.phone && (
                        <div className="form-text">
                          {10 - userDetails.phone.length} digits remaining
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="form-control-plaintext">
                      {user.phone || "Not provided"}
                    </p>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Address</label>
                  {editMode ? (
                    <textarea
                      className="form-control"
                      name="address"
                      rows="2"
                      value={userDetails.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                    />
                  ) : (
                    <p className="form-control-plaintext">
                      {user.address || "Not provided"}
                    </p>
                  )}
                </div>
              </div>

              {/* Required Fields Note */}
              {editMode && (
                <div className="mt-3">
                  <p className="text-muted small">
                    <strong>Note:</strong> Fields marked with * are required. Phone must contain only numbers.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;