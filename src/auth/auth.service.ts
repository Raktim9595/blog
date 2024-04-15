import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(userData: AuthDto) {
    const hash = await argon.hash(userData.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: userData.email,
          hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
        // TODO: Implement transformer for above return data logic
      });
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email is already registered');
        }
      }
      throw error;
    }
  }
}
