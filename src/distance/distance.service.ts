import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Driver } from 'src/drivers/entities/driver.entity';

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

    private haversineDistance(coord1, coord2) {
            const R = 6371; // Earth radius in km
            const toRad = angle => angle * (Math.PI / 180);

            const dLat = toRad(coord2.lat - coord1.lat);
            const dLon = toRad(coord2.lng - coord1.lng);

            const a =   Math.sin(dLat / 2) ** 2 +
                        Math.cos(toRad(coord1.lat)) *
                        Math.cos(toRad(coord2.lat)) *
                        Math.sin(dLon / 2) ** 2;

                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c;
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
    
    async findClosestDriver(
            pickupLat: number, pickupLng: number,
            drivers: Driver[]
        ){
            const pickup = {lat:pickupLat, lng:pickupLng};
            let closest: Driver | null= null;
            let minDistance = Infinity;

            for (const driver of drivers) {
                    let driverCood = {lat:driver.baseLat, lng: driver.baseLng};
                    const distance = this.haversineDistance(pickup, driverCood);
                    if (distance < minDistance) {
                            minDistance = distance;
                            closest = driver;
                    }
            }

            return closest;

        }
}
