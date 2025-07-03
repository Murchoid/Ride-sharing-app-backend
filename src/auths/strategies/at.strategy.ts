import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, ExtractJwt } from 'passport-jwt';

export type JWTPayload = {
    sub: number,
    email: string,
    role: string,
    isActive: boolean
}

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt-at'){
    constructor(private readonly configServie: ConfigService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configServie.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET')
        })
    }

    validate(payload: JWTPayload){
        return payload;
    }
}