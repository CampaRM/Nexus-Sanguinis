import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { ENV } from '../config/env';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';

export class AuthService {
  async register(data: RegisterDto) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      const error: any = new Error('User already exists with this email');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        full_name: data.full_name,
        email: data.email,
        password_hash,
        id_role: data.id_role,
        id_medical_center: data.id_medical_center,
      },
      include: {
        role: true,
        medical_center: true,
      },
    });

    const token = this.generateToken(user);

    return {
      user: {
        id_user: user.id_user,
        full_name: user.full_name,
        email: user.email,
        role: user.role.role_name,
        id_medical_center: user.id_medical_center,
        medical_center_name: user.medical_center?.name || null,
      },
      token,
    };
  }

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        role: true,
        medical_center: true,
      },
    });

    if (!user) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = this.generateToken(user);

    return {
      user: {
        id_user: user.id_user,
        full_name: user.full_name,
        email: user.email,
        role: user.role.role_name,
        id_medical_center: user.id_medical_center,
        medical_center_name: user.medical_center?.name || null,
      },
      token,
    };
  }

  async getProfile(id_user: number) {
    const user = await prisma.user.findUnique({
      where: { id_user },
      select: {
        id_user: true,
        full_name: true,
        email: true,
        id_medical_center: true,
        role: {
          select: { id_role: true, role_name: true },
        },
        medical_center: {
          select: { id_medical_center: true, name: true, type: true },
        },
      },
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  private generateToken(user: any): string {
    return jwt.sign(
      {
        id_user: user.id_user,
        email: user.email,
        role: user.role.role_name,
        id_medical_center: user.id_medical_center,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );
  }
}
