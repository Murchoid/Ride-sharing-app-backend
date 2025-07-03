import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { Booking } from 'src/bookings/entities/booking.entity';
import { getAccessToken, triggerStkPush } from './utils/mpesa.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    private configService: ConfigService
  ){}
  async create(createPaymentDto: CreatePaymentDto) {
    const {bookingId, phoneNumber} = createPaymentDto;
    const booking = await this.bookingRepo.findOne({
      where:{id: bookingId}
    });

    if(!booking) throw new NotFoundException('Booking not found please check id');
    
    const amount = booking.price;
    // call mpesa api
    const consumerKey = this.configService.get('CONSUMER_KEY');
    const consumerSecret = this.configService.get('CONSUMER_SECRET');
    const shortcode = this.configService.get('SHORTCODE');
    const passkey = this.configService.get('PASSKEY');
    const callbackUrl = this.configService.get('MPESA_CALLBACK_URL');

    const token = await getAccessToken(consumerKey, consumerSecret);
    const response = await triggerStkPush(phoneNumber, amount, token, shortcode, passkey,callbackUrl);

    console.log(response);

    const status = 'PAID';

  }

  async findAll() {
    return await this.paymentRepo.find();
  }

  async findOne(id: string) {
    return await this.paymentRepo.findOneBy({id});
  }

}
