# **📌 Travel Echo API Documentation**

## **🌐 Base URL**

```http
http://localhost:6291
```

---

## **🔒 Authentication**

### **1️⃣ Log In**

- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response:**
  ```json
  {
    "success": "true",
    "message": "Login successful",
    "user": {
      "_id": "67d2ac7ffc1e7c3b201926ab",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "profile": "67d2ac7ffc1e7c3b201926ac",
      "token": "jwt_token"
    }
  }
  ```

---

### **2️⃣ Register**

- **Endpoint:** `POST /api/auth/register`
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "user@example.com",
    "password": "yourpassword",
    "confirmPassword": "yourpassword"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "_id": "67d2ac7ffc1e7c3b201926ab",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "USER",
      "profile": "67d2ac7ffc1e7c3b201926ac"
    }
  }
  ```

---

### **3️⃣ Send OTP**

- **Endpoint:** `POST /api/auth/otp`
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "OTP sent to email successfully."
  }
  ```

---

## **👤 User Profiles**

### **1️⃣ Get User Profile**

- **Endpoint:** `GET /api/profiles/<profile_id>` (_Get user profile by profile ID_)
- **Endpoint:** `GET /api/profiles/<user_id>?key=user` (_Get user profile by user ID_)
- **Authorization:** `Bearer Token Required`
- **Response:**
  ```json
  {
    "success": true,
    "data": {...}
  }
  ```

---

### **2️⃣ Update User Profile**

- **Endpoint:** `PUT /api/profiles/<profile_id>`
- **Authorization:** `Bearer Token Required`
- **Request Body (example):**
  ```json
  {
    "country": "Canada",
    "city": "Toronto",
    "languages": ["English", "French", "German"]
  }
  ```
- **Response:**
  ```json
  {
    "message": "Profile updated successfully",
    "data": {...}
  }
  ```

---

### **3️⃣ Upload User Profile Image**

- **Endpoint:** `PUT /api/profiles/image/<profile_or_user_id>`
- **Authorization:** `Bearer Token Required`
- **Request Body:** `FormData`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profile image uploaded successfully.",
    "imageUrl": "http://res.cloudinary.com/.../image.jpg"
  }
  ```

---

### **4️⃣ Remove User Profile Image**

- **Endpoint:** `DELETE /api/profiles/image/<profile_or_user_id>`
- **Authorization:** `Bearer Token Required`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profile image removed successfully."
  }
  ```

---
