import {Controller, Get, Res} from '@nestjs/common';
import { Response } from 'express';
import {join} from "path";

@Controller()
export class AppController {
  @Get()
  catchAll(@Res() response: Response) {
    response.sendFile(join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
  }
}
