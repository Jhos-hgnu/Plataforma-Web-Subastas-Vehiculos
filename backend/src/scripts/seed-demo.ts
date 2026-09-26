import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FirebaseService } from '../firebase/firebase.service';

const password = 'Demo1234!';
const users = [
  { email: 'demo1@copart.test', firstName: 'Demo', lastName: 'One', phone: '55555551' },
  { email: 'demo2@copart.test', firstName: 'Demo', lastName: 'Two', phone: '55555552' },
  { email: 'demo3@copart.test', firstName: 'Demo', lastName: 'Three', phone: '55555553' },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const firebase = app.get(FirebaseService);
  for (const user of users) {
    let record;
    try {
      record = await firebase.auth.createUser({ email: user.email, password });
    } catch (error: unknown) {
      if ((error as { code?: string }).code !== 'auth/email-already-exists') throw error;
      record = await firebase.auth.getUserByEmail(user.email);
    }
    const profileRef = firebase.database.ref(`users/${record.uid}`);
    const profile = await profileRef.once('value');
    if (!profile.exists()) {
      await profileRef.set({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        createdAt: new Date().toISOString(),
      });
    }
    console.log(`Ready: ${user.email}`);
  }
  await firebase.close();
  await app.close();
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
