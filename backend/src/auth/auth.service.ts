import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface FirebaseIdentityResponse {
  localId: string;
  email: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

@Injectable()
export class AuthService {
  private readonly apiKey: string;

  constructor(private readonly firebase: FirebaseService, config: ConfigService) {
    this.apiKey = config.getOrThrow<string>('FIREBASE_WEB_API_KEY');
  }

  async register(dto: RegisterDto) {
    const result = await this.identityRequest('signUp', {
      email: dto.email,
      password: dto.password,
      returnSecureToken: true,
    });
    try {
      await this.firebase.database.ref(`users/${result.localId}`).set({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: result.email,
        phone: dto.phone,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      try {
        await this.firebase.auth.deleteUser(result.localId);
      } catch {
        // Preserve the original database error if compensating rollback also fails.
      }
      throw new InternalServerErrorException('Could not create user profile');
    }
    return this.cleanResponse(result);
  }

  login(dto: LoginDto) {
    return this.identityRequest('signInWithPassword', {
      email: dto.email,
      password: dto.password,
      returnSecureToken: true,
    }).then((result) => this.cleanResponse(result));
  }

  private async identityRequest(action: string, body: Record<string, unknown>): Promise<FirebaseIdentityResponse> {
    let response: Response;
    try {
      response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      throw new InternalServerErrorException('Firebase Authentication is unavailable');
    }
    const payload = await response.json() as FirebaseIdentityResponse & { error?: { message?: string } };
    if (!response.ok) this.mapFirebaseError(payload.error?.message);
    return payload;
  }

  private mapFirebaseError(code?: string): never {
    if (code === 'EMAIL_EXISTS') throw new ConflictException('Email already exists');
    if (code === 'INVALID_EMAIL') throw new BadRequestException('Invalid email');
    if (['INVALID_LOGIN_CREDENTIALS', 'EMAIL_NOT_FOUND', 'INVALID_PASSWORD'].includes(code ?? '')) {
      throw new UnauthorizedException('Invalid credentials');
    }
    throw new InternalServerErrorException('Firebase Authentication error');
  }

  private cleanResponse(result: FirebaseIdentityResponse) {
    return {
      uid: result.localId,
      email: result.email,
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    };
  }
}
