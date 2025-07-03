// src/payments/utils/mpesa.util.ts
import axios from 'axios';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';

export async function getAccessToken(consumerKey: string, consumerSecret: string): Promise<string> {
  const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const auth = 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await axios.get(url, {
    headers: { Authorization: auth },
  });

  return response.data.access_token;
}

export async function triggerStkPush(
  phoneNumber: string,
  amount: number,
  accessToken: string,
  shortcode: number,
  passkey: string
): Promise<any> {
  const timestamp = moment().format('YYYYMMDDHHmmss');
  const password = Buffer.from(
    shortcode +
      passkey +
      timestamp,
  ).toString('base64');

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: shortcode,
    PhoneNumber: phoneNumber,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: 'RideShareApp',
    TransactionDesc: 'Payment for Ride',
  };

  const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
  const auth = 'Bearer ' + accessToken;

  const response = await axios.post(url, payload, {
    headers: { Authorization: auth },
  });

  return response.data;
}
