import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthsService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private JWTservice: JwtService,
    private configService: ConfigService,
  ) {}

  private async getTokens(
    id: string,
    role: string,
    email: string,
    isActive: boolean,
  ) {
  
    const [at, rt] = await Promise.all([
      this.JWTservice.signAsync(
        {
          sub: id,
          email: email,
          role: role,
          isActive: isActive,
        },
        {
          secret: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
          ),
        },
      ),
      this.JWTservice.signAsync(
        {
          sub: id,
          email: email,
          role: role,
          isActive: isActive,
        },
        {
          secret: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
          ),
        },
      ),
    ]);

    return { access_token: at, refresh_token: rt };
  }

  private async hashToken(data: string) {
    const salt = await bcrypt.genSalt(10);
    const hashData = await bcrypt.hash(data, salt);
    return hashData;
  }

  private async saveRefreshToken(id: string, rt: string) {
    const hashRefreshToken = await this.hashToken(rt);

    await this.userRepo.update(id, { refreshToken: hashRefreshToken });
  }

  async signIn(user: CreateAuthDto) {
    
    const findUser = await this.userRepo.findOne({
      where: { email: user.email, isActive: true },
      select: ['id', 'email', 'password', 'role', 'isActive', 'refreshToken'],
    });

    
    if (!findUser) {
      throw new NotFoundException('User not foud please register');
    }
    const pass = user.password;
    const hashPass = findUser.password;

    let compare_pass =  await bcrypt.compare(pass, hashPass);
    
    if (!compare_pass) {
      throw new NotFoundException('Invalid credentials!');
    }
    const { access_token, refresh_token } = await this.getTokens(
      findUser.id,
      findUser.role,
      findUser.email,
      findUser.isActive,
    );

    

    await this.saveRefreshToken(findUser.id, refresh_token);

    return { access_token, refresh_token };
  }

  async signOut(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    await this.userRepo.update(user.id, { refreshToken: undefined });
  }

  async refreshTokens(id: string, refreshToken: string) {
    const foundUser = await this.userRepo.findOne({
      where: { id },
    });

    if (!foundUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!foundUser.refreshToken) {
      throw new NotFoundException('No refresh token found');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      foundUser.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new NotFoundException('Invalid refresh token');
    }

    const { access_token, refresh_token: newRefreshToken } =
      await this.getTokens(
        foundUser.id,
        foundUser.role,
        foundUser.email,
        foundUser.isActive,
      );

    await this.saveRefreshToken(foundUser.id, newRefreshToken);

    return { access_token, refreshToken: newRefreshToken };
  }
}
