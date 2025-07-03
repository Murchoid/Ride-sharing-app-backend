import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreatePaymentDto {
     @ApiProperty({
        description: "phone number to recieve stk push",
        example: "0799431541"
      })
    @IsString()
    phoneNumber: string;

     @ApiProperty({
        description: "valid booking id",
        example: "diz-deezuts"
      })
    @IsString()
    bookingId: string;
}
