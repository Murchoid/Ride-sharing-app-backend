import { Controller, Post } from '@nestjs/common';
import { FakerService } from './faker.service';

@Controller('faker')
export class FakerController {
  constructor(private readonly fakerService: FakerService) {}

  @Post()
  faker() {
    return this.fakerService.seed();
  }
}
