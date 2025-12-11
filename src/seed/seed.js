import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { connectDB, getRepository } from '../db.js';

async function run() {
  const { repo } = await connectDB();

  const roles = ['admin', 'employee'];
  const subjectsPool = ['Math', 'Science', 'History', 'Art', 'CS', 'English'];

  const items = [];
  for (let i = 0; i < 50; i++) {
    const role = i < 5 ? 'admin' : 'employee';
    const name = faker.person.fullName();
    const email = faker.internet.email({ firstName: faker.person.firstName(), lastName: faker.person.lastName() }).toLowerCase();
    const age = faker.number.int({ min: 18, max: 65 });
    const attendance = faker.number.float({ min: 60, max: 100, fractionDigits: 2 });
    const className = faker.helpers.arrayElement(['A', 'B', 'C', 'D']);
    const subjects = faker.helpers.arrayElements(subjectsPool, faker.number.int({ min: 2, max: 4 }));
    const avatar = faker.image.avatar();
    const date = faker.date.past({ years: 2 }).toISOString();
    const flagged = faker.datatype.boolean();
    const passwordHash = await bcrypt.hash('password123', 10);

    items.push({
      name,
      age,
      class: className,
      subjects,
      attendance,
      role,
      avatar,
      date,
      email,
      flagged,
      passwordHash,
    });
  }

  await repo.insertMany(items);
  console.log('Seeded ~50 employees');
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});