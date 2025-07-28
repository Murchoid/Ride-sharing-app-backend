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
    if(response){
      const preparedPayment =  this.paymentRepo.create({
        booking:booking,
        phoneNumber: phoneNumber,
        amount: amount,
        merchantRequestId: response.MerchantRequestID,
        status: 'SUCCESS', // Assuming success for now, handle actual status in callback
      });

      console.log(preparedPayment);
      return await this.paymentRepo.save(preparedPayment);
      
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

  async findOneByBookingId(id: string){
    return await this.paymentRepo.findOneBy({ 
      booking: { id },
    });
  }

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const { bookingId } = createPaymentDto;

    // First, set all previous payment attempts for this booking to not latest
    await this.paymentRepo.update(
      { bookingId },
      { isLatestAttempt: false }
    );

    // Create new payment attempt
    const payment = this.paymentRepo.create({
      ...createPaymentDto,
      isLatestAttempt: true
    });

    return await this.paymentRepo.save(payment);
  }

  async getPaymentHistory(bookingId: string) {
    return await this.paymentRepo.find({
      where: { bookingId },
      order: { createdAt: 'DESC' }
    });
  }

  async getLatestPayment(bookingId: string) {
    return await this.paymentRepo.findOne({
      where: { bookingId, isLatestAttempt: true }
    });
  }

  async updatePaymentStatus(
    paymentId: string, 
    status: string, 
    failureReason?: string
  ) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['booking']
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = status;
    payment.failureReason = failureReason as string;

    // If payment is successful, update booking payment status
    if (status === 'PAID') {
      await this.bookingRepo.update(
        payment.bookingId,
        { paymentStatus: 'PAID' }
      );
    }

    return await this.paymentRepo.save(payment);
  }
}
