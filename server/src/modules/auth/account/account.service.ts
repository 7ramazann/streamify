import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountService {
    findAll(): string {
        return 'Hello World!';
      }
}
