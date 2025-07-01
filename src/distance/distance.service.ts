import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class DistanceService {
    constructor(
        private configService: ConfigService
    ){}

    private async fetchDistanceandDuration(
        pickupLat: number, pickupLng: number,
        dropoffLat: number, dropoffLng: number
    ) {
        const apiKey = this.configService.getOrThrow<string>('OPENROUTESERVICE_KEY');
        const body = JSON.stringify({
            locations: [
                [pickupLng, pickupLat],
                [dropoffLng, dropoffLat]
            ]
        });

        const response = await fetch('https://api.openrouteservice.org/v2/matrix/driving-car', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                'Authorization': `${apiKey}`,
                'Content-Type': 'application/json; charset=utf-8'
            },
            body
        });

        return response.json();
    }

    async calculatePriceandReturnDuraiton(
        pickupLat: number, pickupLng: number,
        dropoffLat: number, dropoffLng: number
    ){
        const response = await this.fetchDistanceandDuration(pickupLat, pickupLng,
        dropoffLat, dropoffLng);

        const durationAtoB = response.durations[0][1]/60; 
        const snappedPickup = response.destinations[0].snapped_distance;
        const snappedDropoff = response.destinations[1].snapped_distance;
        const distance = snappedDropoff-snappedPickup;

        //pricing logic
        const base_price = 100;
        const distance_Km = distance/1000;
        const value_added_per_km = 50;
        const calculated_price = base_price + value_added_per_km * distance_Km;

        return{
            calculated_price,
            durationAtoB,
            distance_Km
        }
    }
}
