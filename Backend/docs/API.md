# JobYatra Authentication API Documentation

Base URL: `/api/auth`

## 1. Register a new user
**Endpoint:** `POST /register`
**Description:** Register a new user with standard email and password.
**Auth Required:** No

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "strongPassword123",
  "role": "user" 
}
```
*Note: `role` can be `user`, `recruiter`, or `admin`.*

**Response:** (201 Created)
Returns access token, refresh token (in cookie + body), and user info.

---

## 2. Login
**Endpoint:** `POST /login`
**Description:** Authenticate user and get token.
**Auth Required:** No

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "strongPassword123"
}
```

**Response:** (200 OK)
Returns access token, refresh token (in cookie + body), and user info.

---

## 3. Google OAuth Login
**Endpoint:** `POST /google`
**Description:** Authenticate user via Google OAuth ID Token from frontend.
**Auth Required:** No

**Request Body:**
```json
{
  "tokenId": "eyJhbGciOiJSUz... (Google ID token from frontend)"
}
```

**Response:** (200 OK or 201 Created)
Returns access token, refresh token, and user info.

---

## 4. Get Current User
**Endpoint:** `GET /me`
**Description:** Get currently logged-in user details.
**Auth Required:** Yes (Bearer Token)

**Headers:**
`Authorization: Bearer <your_access_token>`

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "60d...123",
    "name": "Jane",
    "email": "jane@example.com",
    "role": "user",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## 5. Logout
**Endpoint:** `POST /logout`
**Description:** Clear user's refresh token cookie.
**Auth Required:** Yes

**Headers:**
`Authorization: Bearer <your_access_token>`

---

## 6. Forgot Password (OTP Generation)
**Endpoint:** `POST /forgot-password`
**Description:** Generates a 6-digit OTP and sends it to user's email.
**Auth Required:** No

**Request Body:**
```json
{
  "email": "jane@example.com"
}
```

---

## 7. Verify OTP
**Endpoint:** `POST /verify-otp`
**Description:** Verifies the OTP sent to user's email.
**Auth Required:** No

**Request Body:**
```json
{
  "email": "jane@example.com",
  "otp": "123456"
}
```

---

## 8. Reset Password
**Endpoint:** `POST /reset-password`
**Description:** Resets the password using valid OTP as reset token.
**Auth Required:** No

**Request Body:**
```json
{
  "email": "jane@example.com",
  "resetToken": "123456", 
  "newPassword": "newStrongPassword456"
}
```
*(Note: resetToken is the 6-digit OTP the user received)*
