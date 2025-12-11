import mongoose from 'mongoose';
import EmployeeModel from './models/Employee.js';

let memoryStore = [];
let connected = false;

export async function connectDB() {
  console.log('process.env.MONGO_URI', process.env.MONGO_URI);
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('MONGO_URI not set, using in-memory store');
    return { connected: false, repo: await getRepository() };
  }
  try {
    await mongoose.connect(uri);
    connected = true;
    console.log('Connected to MongoDB');
    return { connected: true, repo: await getRepository() };
  } catch (err) {
    console.warn('MongoDB connection failed, falling back to memory:', err.message);
    connected = false;
    return { connected: false, repo: await getRepository() };
  }
}

export async function getRepository() {
  if (connected) {
    // Mongo-backed repository
    return {
      async findAll() {
        // Projection to limit returned fields can be added as needed
        const docs = await EmployeeModel.find({}).lean();
        return docs.map((d) => ({ ...serialize(d) }));
      },
      async findById(id) {
        const d = await EmployeeModel.findById(id).lean();
        return d ? serialize(d) : null;
      },
      async findByEmail(email) {
        const d = await EmployeeModel.findOne({ email }).lean();
        return d ? serialize(d) : null;
      },
      async create(payload) {
        const doc = await EmployeeModel.create(payload);
        return serialize(doc.toObject());
      },
      async updateById(id, update) {
        const doc = await EmployeeModel.findByIdAndUpdate(id, update, { new: true }).lean();
        return doc ? serialize(doc) : null;
      },
      async deleteById(id) {
        await EmployeeModel.findByIdAndDelete(id);
      },
      async insertMany(items) {
        await EmployeeModel.insertMany(items, { ordered: false });
      },
    };
  }

  // In-memory repository fallback
  return {
    async findAll() {
      return memoryStore.map((d) => ({ ...d }));
    },
    async findById(id) {
      return memoryStore.find((d) => String(d.id) === String(id)) || null;
    },
    async findByEmail(email) {
      return memoryStore.find((d) => d.email === email) || null;
    },
    async create(payload) {
      const id = payload.id || String(Date.now() + Math.random());
      const doc = { ...payload, id };
      memoryStore.push(doc);
      return { ...doc };
    },
    async updateById(id, update) {
      const idx = memoryStore.findIndex((d) => String(d.id) === String(id));
      if (idx >= 0) {
        memoryStore[idx] = { ...memoryStore[idx], ...update };
        return { ...memoryStore[idx] };
      }
      return null;
    },
    async deleteById(id) {
      memoryStore = memoryStore.filter((d) => String(d.id) !== String(id));
    },
    async insertMany(items) {
      memoryStore.push(...items.map((i) => ({ ...i, id: i.id || String(Date.now() + Math.random()) })));
    },
  };
}

function serialize(doc) {
  const id = doc._id ? String(doc._id) : String(doc.id);
  return {
    id,
    name: doc.name,
    age: doc.age,
    class: doc.class,
    subjects: doc.subjects || [],
    attendance: doc.attendance,
    role: doc.role,
    avatar: doc.avatar,
    date: doc.date instanceof Date ? doc.date.toISOString() : doc.date,
    email: doc.email,
    flagged: !!doc.flagged,
    passwordHash: doc.passwordHash,
  };
}