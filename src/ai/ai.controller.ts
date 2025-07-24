import { Controller, Post, Body, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { CreateAiDto } from './dto/create-ai.dto';
import { ROLES } from 'src/auths/decorators/roles.decorator';
import { eROLE } from 'src/common/types/roles.types';
import { RequestWithUser } from 'src/common/types/request.interface';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ROLES(eROLE.CUSTOMER, eROLE.ADMIN, eROLE.DRIVER)
  @Post('/user-query')
  async handleUserQuery(@Body() createAiDto: CreateAiDto, @Req() req: RequestWithUser) {
    const { prompt } = createAiDto;
    const userInfo = req.user;
    const id = userInfo.sub;
    return this.aiService.handleUserPrompt(prompt, id);
  }

  @ROLES(eROLE.ADMIN)
  @Post('/admin-query')
  async handleAdminQuery(@Body() createAiDto: CreateAiDto) {
    const { prompt } = createAiDto;
    return this.aiService.handleAdminAnalytics(prompt);
  }

  @ROLES(eROLE.DRIVER)
  @Post('/driver-query')
  async handleDriverQuery(@Body() createAiDto: CreateAiDto, @Req() req: RequestWithUser) {
    const { prompt } = createAiDto;
    const userInfo = req.user;
    const id = userInfo.sub;
    return this.aiService.handleDriverPrompt(prompt, id);
  }
}
