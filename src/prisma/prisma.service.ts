import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          // Todo: use env,
          url: 'postgresql://postgres:admin@localhost:5434/blog?schema=public',
        },
      },
    });
  }
}
