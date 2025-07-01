import { IsEnum, IsNumber, IsString, IsUUID } from "class-validator";

enum ePAYMENTSTUTUS{
       PENDING='PENDING',
       ACCEPTED='ACCEPTED',
       COMPLETED='COMPLETED',
       CANCELLED='CANCELLED'
}

enum ePAYMENTSMETHOD{
    CASH='CASH',
    MPESA='MPESA',
    CARD='CARD'
}

export class CreateBookingDto {
    @IsUUID()
    driverId: string;

    @IsUUID()
    customerId: string;

    @IsString()
    pickupAddress: string;

    @IsString()
    dropoffAddress: string;

    @IsNumber()
    pickupLat: number;

    @IsNumber()
    pickupLng: number

    @IsNumber()
    dropoffLat: number;
    
    @IsNumber()
    dropoffLng: number;
    
    @IsNumber()
    distanceKm: number;
    
    @IsNumber()
    durationMins: number;
    
    @IsNumber()
    price: number;
    
    @IsEnum(ePAYMENTSTUTUS)
    stutus: string | ePAYMENTSTUTUS.PENDING;

    @IsEnum(ePAYMENTSTUTUS)
    paymentStatus: string | ePAYMENTSTUTUS.PENDING;

    @IsEnum(ePAYMENTSMETHOD)
    paymentMethod: string | ePAYMENTSMETHOD.CASH;
    
}
