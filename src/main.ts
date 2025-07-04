import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './http.exception.filters';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  const { httpAdapter } = app.get(HttpAdapterHost);
  //app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new ResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Student Record Management System')
    .setDescription(
      `🚖 Ride Sharing Web App API
A backend API for a ride sharing system built with NestJS and PostgreSQL.
It supports customer bookings, automatic driver assignment based on location, dynamic price estimation, and integrated MPESA mobile payments.
Admins can manage drivers and vehicles, and all roles get real-time analytics dashboards.
Authentication is JWT-based with full role-based access control.

⚙️ Features:

Customer ride bookings with distance-based pricing

Auto-assign nearest available driver

Driver ride management

MPESA STK push payment integration

Admin dashboards with system-wide analytics

Role-based route protection

Clean, predictable API structure with Swagger docs`,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auths')
    .addTag('Users')
    .addTag('Drivers')
    .addTag('Vehicles')
    .addTag('Bookings')
    .addTag('Analytics')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      showRequestDuration: true,
      tryItOutEnabled: true,
    },
    customCss: `
    .swagger-ui .topbar { display: none; }  
    .swagger-ui .info { margin-bottom: 20px; }
  `,
    customSiteTitle: 'Ride sharing app',
  });


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
