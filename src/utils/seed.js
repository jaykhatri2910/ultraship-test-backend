const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Employee = require('../models/Employee');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hiring-test';

const subjectsList = ['Math', 'Science', 'History', 'English', 'Art', 'Physics', 'Chemistry'];
const classesList = ['10A', '10B', '11A', '11B', '12A', '12B'];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomArray = (arr, count) => {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    await Employee.deleteMany({});
    console.log('Cleared existing data');

    const employees = [];
    const password = await bcrypt.hash('password123', 10);

    // Create Admin
    employees.push({
      name: 'Admin User',
      age: 35,
      class: 'Staff',
      subjects: [],
      attendance: 100,
      role: 'admin',
      email: 'admin@example.com',
      password,
      avatar: 'https://i.pravatar.cc/150?u=admin',
      date: new Date(),
    });

    // Create 50 Employees
    for (let i = 1; i <= 50; i++) {
      employees.push({
        name: `Employee ${i}`,
        age: getRandomInt(22, 60),
        class: classesList[getRandomInt(0, classesList.length - 1)],
        subjects: getRandomArray(subjectsList, getRandomInt(1, 3)),
        attendance: getRandomInt(60, 100),
        role: 'employee',
        email: `employee${i}@example.com`,
        password,
        avatar: `https://i.pravatar.cc/150?u=${i}`,
        date: new Date(Date.now() - getRandomInt(0, 10000000000)),
      });
    }

    await Employee.insertMany(employees);
    console.log('Seeded 51 employees');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
