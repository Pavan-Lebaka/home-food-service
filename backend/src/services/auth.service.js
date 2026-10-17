import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { supabase } from '../config/supabase.js';
import { db } from '../db/database.js';

class AuthService {
  /**
   * Authenticate admin user against DB & Supabase
   * @param {string} email 
   * @param {string} password 
   */
  async loginAdmin(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Check Live Database seeded Admin Account (Verified via Bcrypt Hash)
    const dbAdmin = db.findAdminByEmail(cleanEmail);
    if (dbAdmin && db.verifyAdminPassword(dbAdmin, cleanPass)) {
      const adminUser = {
        id: dbAdmin.id,
        email: dbAdmin.email,
        name: dbAdmin.name || 'Bramarambika Kitchen Owner',
        role: dbAdmin.role || 'superadmin',
        isAdmin: true
      };

      const token = this.generateToken(adminUser);

      return {
        user: adminUser,
        token,
        expiresIn: env.JWT_EXPIRES_IN
      };
    }

    // 2. Fallback to Supabase Auth user check if Supabase has confirmed email
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass
        });

        if (!error && data?.user) {
          const adminUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || 'Bramarambika Kitchen Owner',
            role: 'admin',
            isAdmin: true
          };

          const token = this.generateToken(adminUser);

          return {
            user: adminUser,
            token,
            expiresIn: env.JWT_EXPIRES_IN
          };
        }
      } catch (err) {
        // Continue to unauthorized error
      }
    }

    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      'Invalid email or password. Please check your admin credentials.'
    );
  }

  /**
   * Issue JWT token using cryptographically secure HEX secret key
   */
  generateToken(payload) {
    return jwt.sign(payload, env.HEX_SECRET_KEY, {
      expiresIn: env.JWT_EXPIRES_IN
    });
  }

  /**
   * Verify token and return user payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, env.HEX_SECRET_KEY);
    } catch (err) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired token.');
    }
  }
}

export const authService = new AuthService();
