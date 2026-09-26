import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Database, getDatabase } from 'firebase-admin/database';

@Injectable()
export class FirebaseService {
  private readonly app: App;
  readonly auth: Auth;
  readonly database: Database;

  constructor(config: ConfigService) {
    const projectId = config.getOrThrow<string>('FIREBASE_PROJECT_ID');
    const clientEmail = config.getOrThrow<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = config
      .getOrThrow<string>('FIREBASE_PRIVATE_KEY')
      .replace(/\\n/g, '\n');
    const databaseURL = config.getOrThrow<string>('FIREBASE_DATABASE_URL');

    this.app = getApps()[0] ?? initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      databaseURL,
    });
    this.auth = getAuth(this.app);
    this.database = getDatabase(this.app);
  }
}
