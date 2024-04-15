import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
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

  async signin(userData: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });
    if (!user) throw new ForbiddenException('Credentials incorrect');

    const pwMatch = await argon.verify(user.hash, userData.password);
    if (!pwMatch) throw new ForbiddenException('Credentials incorrect');
    delete user.hash;

    const payload = {
      sub: user.id,
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`,
    };
    const secret = this.config.get('JWT_SECRET');
    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '48h',
        secret: secret,
      }),
    };
  }
}
