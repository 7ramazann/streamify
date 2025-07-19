import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserInput } from './inputs/create-user.input';
import { PrismaService } from '@/core/prisma/prisma.service';
import { hash } from 'argon2';
import { VerificationService } from '../verification/verification.service';

@Injectable()
export class AccountService {
    constructor(
      private readonly prismaService: PrismaService,
      private readonly verificationService: VerificationService
    ) {}

  
    async findAll() {
      return this.prismaService.user.findMany();
    }    

    public async create(input: CreateUserInput) {
      // Destructure username, email, password from input
      const { username, email, password } = input;

      // Check if username or email already exists in the database
      const existingUser = await this.prismaService.user.findFirst({
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

      const user = await this.prismaService.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          displayName: username
        }
      })

      await this.verificationService.sendVerificationToken(user)

      return true
    }

    // Add this method to retrieve current user
    public async me(id: string) {
      const user = await this.prismaService.user.findUnique({
        where: {
			  id,
  		  },
  	  })
  	  return user
    }

}
