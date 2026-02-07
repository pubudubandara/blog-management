import userRepository from "../repositories/userRepository.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

class AuthService {
  async register(data) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError("Email already in use", 400);
    }

    // Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    // Save user to database
    const userId = await userRepository.create({ ...data, password_hash });

    // Return user data without password
    return {
      id: userId,
      username: data.username,
      email: data.email,
      role: data.role || "user",
    };
  }

  async login(email, password) {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    // Create short-lived access token
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }, // Short expiry for security
    );

    // Create long-lived refresh token
    const refreshToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }, // Long expiry
    );

    // Return user data and both tokens
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  //Add logout method
  async logout(userId, refreshToken) {
    console.log(`User ${userId} logged out`);
  }

  //Add refresh token method
  async refreshToken(refreshToken) {
    try {
      // Verify the refresh token signature and expiration
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );

      // Generate new access token with same user data
      const accessToken = jwt.sign(
        { id: decoded.id, role: decoded.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" },
      );

      return { accessToken };
    } catch (err) {
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }
}

// Create single instance
const authService = new AuthService();

export default authService;
