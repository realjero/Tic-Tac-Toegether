import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";


async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Configure Swagger for API documentation.
    const config = new DocumentBuilder()
        .setTitle('TicTacToegether-API Documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document); // Serve the Swagger API documentation at the '/api' route.

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
            transform: true,
        })
    );

    await app.listen(3000);
}

bootstrap();
