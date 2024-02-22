import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { Public } from './authentication/decorators/Public';

@Controller()
export class AppController {
  @Public()
  @Get()
  catchAll(@Res() response: Response) {
    response.sendFile(
      join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'),
    );
  }
}
