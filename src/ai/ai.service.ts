import { Injectable } from '@nestjs/common';
import { AiGeminiService } from './ai-gemini.service';
import { DataSource } from 'typeorm';
import { Booking } from 'src/bookings/entities/booking.entity';
import { CreateBookingDto } from 'src/bookings/dto/create-booking.dto';
import { BookingsService } from 'src/bookings/bookings.service';
import { DistanceService } from 'src/distance/distance.service';

@Injectable()
export class AiService {
  constructor(
    private readonly aiGemini: AiGeminiService,
    private readonly dataSource: DataSource,
    private readonly bookingService: BookingsService, 
    private readonly distanceService: DistanceService
  ) {}

  // Handle user prompt: could be booking or analytics or general help
  async handleUserPrompt(prompt: string, id: string): Promise<{ booking: Booking; type: string; } | string | undefined> {
    const intent = await this.aiGemini.classifyIntent(prompt);
    const schema = this.getSchema();
    const enumSchema = this.getEnumsSchema();

    switch (intent) {
      case 'create_booking':
        const bookingJson = await this.aiGemini.generateBookingValues(prompt, schema, enumSchema);
        console.log(bookingJson);
        if (!bookingJson) return 'Sorry, I couldn’t understand your booking request.';
        let bookingValues;
        const preparedJson = bookingJson.replace('```json', '').replace('```', '').trim();

        try {
          bookingValues = JSON.parse(preparedJson);
        } catch (e) {
          return 'Failed to parse booking values from AI.';
        }
        // Prepare CreateBookingDto and call bookingsService.create
        return this.createBookingFromAi(bookingValues, id);

      case 'analytics_query':
        const analyticsSql = await this.aiGemini.generateAnalyticsSQL(prompt, schema, enumSchema);
        if(!analyticsSql) {
          return 'Sorry, I couldn’t understand your analytics request.';
        }
        return this.executeSQL(analyticsSql, id);
      case 'general_help':
        return this.aiGemini.generateHelpResponse(prompt);
      default:
        return 'Sorry, I couldn’t understand your request.';
    }
  }

  // Admins typically ask for analytics insights
  async handleAdminAnalytics(prompt: string): Promise<string | undefined> {
    const schema = this.getSchema();
    const enumSchema = this.getEnumsSchema();
    return this.aiGemini.generateAnalyticsSQL(prompt, schema, enumSchema);
  }

  // Driver AI logic can be added later
  async handleDriverPrompt(prompt: string, id: string): Promise<string | undefined> {
    const schema = this.getSchema();
    const enumSchema = this.getEnumsSchema();
    return this.aiGemini.generateDriverHelpResponse(prompt, schema, id, enumSchema);
  }

  private getSchema(): string {
  return `
Tables and Relationships:

user (
  id UUID PRIMARY KEY,
  name VARCHAR,
  email VARCHAR UNIQUE,
  password VARCHAR,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  role ENUM('CUSTOMER', 'DRIVER', 'ADMIN'),
  isActive BOOLEAN,
  accessToken VARCHAR,
  refreshToken VARCHAR,
  -- Relations:
  driver REFERENCES driver,
  -- One user can have one driver profile (if role is DRIVER)
  -- One user can have many bookings (as customer)
)

driver (
  id UUID PRIMARY KEY,
  userId REFFERENCES user(id),
  baseLat FLOAT,
  baseLng FLOAT,
  isAvailable BOOLEAN,
  isActive BOOLEAN,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  -- Relations:
  vehicle REFERENCES vehicle,
  -- One driver can have one vehicle
  -- One driver can have many bookings
)

vehicle (
  id UUID PRIMARY KEY,
  model VARCHAR,
  plate VARCHAR UNIQUE,
  driverId REFERENCES driver(id),
  isRetired BOOLEAN,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)

booking (
  id UUID PRIMARY KEY,
  customerId REFERENCES user(id),
  driverId REFERENCES driver(id),
  pickupAddress VARCHAR,
  dropoffAddress VARCHAR,
  pickupLat FLOAT,
  pickupLng FLOAT,
  dropoffLat FLOAT,
  dropoffLng FLOAT,
  distanceKm FLOAT,
  durationMins FLOAT,
  price FLOAT,
  status ENUM('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'),
  paymentMethod ENUM('CASH', 'MPESA', 'CARD'),
  paymentStatus ENUM('PENDING', 'PAID'),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  -- Relations:
  payment REFERENCES payment
)

payment (
  id UUID PRIMARY KEY,
  bookingId  REFERENCES booking(id),
  phoneNumber VARCHAR,
  amount FLOAT,
  merchantRequestId VARCHAR,
  status ENUM('PENDING', 'SUCCESS', 'FAILED'),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)

Notes:
- Use double quotes for all column and table names in SQL queries.
- All relationships are via foreign keys as described.
- Enum values must match exactly.
`;
}

private getEnumsSchema(): string {
  return `
Enums:

1. role:
  - CUSTOMER: Regular user who books rides.
  - DRIVER: User who offers rides.
  - ADMIN: System administrator.

2. status:
  - PENDING: Booking has been created but not yet accepted.
  - ACCEPTED: Booking has been accepted by a driver.
  - IN_PROGRESS: The ride is currently ongoing.
  - COMPLETED: The ride has been completed.
  - CANCELLED: The booking was cancelled.

3. PaymentStatus:
  - PENDING: Payment is not yet completed.
  - PAID: Payment has been successfully completed.
  - FAILED: Payment attempt failed.

4. PaymentMethod:
  - CASH: Payment will be done using cash.
  - MPESA: Payment will be done using M-PESA mobile money.
  - CARD: Payment will be done using a credit or debit card.
`;
}


async executeSQL(sql: string, id: string): Promise<string> {
    try {

      const trimmed = sql.replace('```sql', '').replace('```', '').trim();

      console.log(trimmed);
      const injected = trimmed.replace(/{{id}}/g, `${id}`);
      

      if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
        const result = await this.dataSource.query(injected);

        //convert sql response to data that can be used in a table
        const tbData = result.map((row: any) => {
          const newRow: any = {};
          for (const key in row) {
            newRow[key] = row[key];
          }
          return newRow;
        });
       
        return JSON.stringify({ data: tbData, type: 'table' }, null, 2);
      }

      return 'Unsupported or unsafe SQL operation.';
    } catch (err) {
      console.error('SQL execution failed:', err);
      return 'An error occurred during SQL execution.';
    }
  }

  async createBookingFromAi(bookingValues, id: string){
      const { pickupAddress, dropoffAddress, pickupLat, pickupLng, dropoffLat} = bookingValues;

      const pickupCoords = await this.getCoords(pickupAddress);
      const dropoffCoords = await this.getCoords(dropoffAddress);

      const preparedBooking: CreateBookingDto = {
          customerId: id,
          pickupAddress,
          dropoffAddress,
          pickupLat: pickupCoords.lat,
          pickupLng: pickupCoords.lng,
          dropoffLat: dropoffCoords.lat,
          dropoffLng: dropoffCoords.lng,
          distanceKm: 0,
          durationMins: 0,
          price: 100,
          stutus: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: "MPESA"
      }

      console.log(preparedBooking);
      const booking = await this.bookingService.create(preparedBooking);

      return {booking, type: 'booking'};
    }

    async getCoords(address: string): Promise<{ lat: number, lng: number }> {
      const res = await this.distanceService.getCoords(address);
      console.log(res[0]);
      if (!res || res.length < 2) {
        throw new Error('Failed to get coordinates for address: ' + address);
      }
      return {lng: res[0], lat: res[1]}
    }
}