import { IsString } from "class-validator";

export class CreatePaymentDto {
    @IsString()
    phoneNumber: string;

    @IsString()
    bookingId: string;
}
