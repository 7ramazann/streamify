import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserInput } from './inputs/create-user.input';
import { PrismaService } from '@/core/prisma/prisma.service';
import { hash } from 'argon2';

@Injectable()
export class AccountService {
    constructor(private readonly prisma: PrismaService) {}

  
    async findAll() {
      return this.prisma.user.findMany();
    }    

    public async create(input: CreateUserInput) {
      // Destructure username, email, password from input
      const { username, email, password } = input;

      // Check if username or email already exists in the database
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });
  
      // If yes, throw ConflictException
      if (existingUser) {
        throw new ConflictException('Username or email already exists');
      }
      
      // Create new user with:
      // - hashed password, email, default displayName from username
      const hashedPassword = await hash(password);

      await this.prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          displayName: username
        }
      })

      return true
    }
}
