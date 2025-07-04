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
    const response = await triggerStkPush(phoneNumber, 1/*amount*/, token, shortcode, passkey,callbackUrl);

    console.log(response);
    if(response){
      const preparedPayment =  this.paymentRepo.create({
        booking:booking,
        phoneNumber: phoneNumber,
        amount: 1/*amount*/,
        merchantRequestId: response.merchantRequestId,
      });

      try{
          await this.paymentRepo.save(preparedPayment);
      }catch(e){
        if(e.code === '23505') throw new Error('Booking already Exist i will fix')
        throw new Error(e);
      }
    }

  }

  async handleMpesaCallback(data: any) {

  console.log(data);

  const resultCode = data.Body.stkCallback.ResultCode;
  const phoneNumber = data.Body.stkCallback.CallbackMetadata?.Item?.find(i => i.Name === 'PhoneNumber')?.Value;
  const amount = data.Body.stkCallback.CallbackMetadata?.Item?.find(i => i.Name === 'Amount')?.Value;
  const merchantRequestId = data.Body.stkCallback.MerchantRequestID;

  const payment = await this.paymentRepo.findOne({ where: { merchantRequestId } });

  if (!payment) throw new NotFoundException('Payment not found');

  payment.status = resultCode === 0 ? 'SUCCESS' : 'FAILED';
  await this.paymentRepo.save(payment);

  if (resultCode === 0) {
    const booking = await this.bookingRepo.findOne({ where: { id: payment.booking.id } });
    if(!booking) throw new NotFoundException('Booking not found');
    booking.paymentStatus = 'PAID';
    await this.bookingRepo.save(booking);
  }

  return { status: 'ok' };
}

  async findAll() {
    return await this.paymentRepo.find();
  }

  async findOne(id: string) {
    return await this.paymentRepo.findOneBy({id});
  }

}
