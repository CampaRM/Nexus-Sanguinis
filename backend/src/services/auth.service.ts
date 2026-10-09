import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { ENV } from '../config/env';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';

export class AuthService {
  async register(data: RegisterDto | any) {
    try {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        const error: any = new Error('User already exists with this email');
        error.statusCode = 409;
        throw error;
      }

      // 1. Validar y convertir id_role a número explícito
      // Si id_role viene nulo o no mapea correctamente, asignar por defecto el ID 2 (BANK_MANAGER)
      let id_role = 2;
      if (data.id_role !== undefined && data.id_role !== null && data.id_role !== '') {
        const parsedRole = Number(data.id_role);
        if (!isNaN(parsedRole) && parsedRole > 0) {
          id_role = parsedRole;
        }
      }

      // Validar si el rol existe en la base de datos
      const roleExists = await prisma.role.findUnique({
        where: { id_role },
      });
      if (!roleExists) {
        const defaultRole = await prisma.role.findUnique({
          where: { id_role: 2 },
        });
        if (defaultRole) {
          id_role = 2;
        } else {
          const error: any = new Error('Rol o centro médico no válido');
          error.statusCode = 400;
          throw error;
        }
      }

      // 2. Validar y convertir id_medical_center a número explícito
      let id_medical_center: number | null = null;
      if (
        data.id_medical_center !== undefined &&
        data.id_medical_center !== null &&
        data.id_medical_center !== ''
      ) {
        const parsedCenter = Number(data.id_medical_center);
        if (isNaN(parsedCenter) || parsedCenter <= 0) {
          const error: any = new Error('Rol o centro médico no válido');
          error.statusCode = 400;
          throw error;
        }

        const centerExists = await prisma.medicalCenter.findUnique({
          where: { id_medical_center: parsedCenter },
        });
        if (!centerExists) {
          const error: any = new Error('Rol o centro médico no válido');
          error.statusCode = 400;
          throw error;
        }

        id_medical_center = parsedCenter;
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(data.password, salt);

      const user = await prisma.user.create({
        data: {
          full_name: data.full_name,
          email: data.email,
          password_hash,
          id_role,
          id_medical_center,
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
    } catch (err: any) {
      if (
        err.code === 'P2003' ||
        (err.message && err.message.toLowerCase().includes('foreign key constraint'))
      ) {
        const error: any = new Error('Rol o centro médico no válido');
        error.statusCode = 400;
        throw error;
      }
      throw err;
    }
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
