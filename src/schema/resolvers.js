import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper: apply filters, sorting, and pagination on arrays
function applyQuery(list, { filter, sortBy, page = 1, pageSize = 10 } = {}) {
  let result = [...list];

  // Filtering
  if (filter) {
    const {
      nameContains,
      minAge,
      maxAge,
      role,
      attendanceMin,
      attendanceMax,
    } = filter;
    result = result.filter((e) => {
      const nameOk = nameContains
        ? e.name.toLowerCase().includes(nameContains.toLowerCase())
        : true;
      const minAgeOk = typeof minAge === 'number' ? e.age >= minAge : true;
      const maxAgeOk = typeof maxAge === 'number' ? e.age <= maxAge : true;
      const roleOk = role ? e.role === role : true;
      const attMinOk = typeof attendanceMin === 'number' ? e.attendance >= attendanceMin : true;
      const attMaxOk = typeof attendanceMax === 'number' ? e.attendance <= attendanceMax : true;
      return nameOk && minAgeOk && maxAgeOk && roleOk && attMinOk && attMaxOk;
    });
  }

  // Sorting
  if (sortBy?.field) {
    const dir = sortBy.direction === 'DESC' ? -1 : 1;
    const field = sortBy.field;
    result.sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
  }

  // Pagination (offset-based)
  const total = result.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = result.slice(start, end);

  return { total, page, pageSize, items: pageItems };
}

// Role guard utility
function ensureAdmin(auth) {
  if (!auth?.user || auth.user.role !== 'admin') {
    throw new Error('Admin privileges required');
  }
}

// Allow employee to update limited own fields
const EMPLOYEE_SELF_UPDATABLE = new Set(['name', 'avatar', 'subjects', 'class']);

export const resolvers = {
  Query: {
    // Fetch employees with filter/sort/pagination; use repository for DB or memory
    async employees(_, args, { repo }) {
      const docs = await repo.findAll();
      return applyQuery(docs, args);
    },
    async employee(_, { id }, { repo }) {
      return repo.findById(id);
    },
  },
  Mutation: {
    // Admin-only: add a new employee
    async addEmployee(_, { input }, { auth, repo }) {
      ensureAdmin(auth);
      // If adding with email+password in input, hash password; else seed defaults
      const payload = { ...input };
      if (input.password) {
        payload.passwordHash = await bcrypt.hash(input.password, 10);
        delete payload.password;
      }
      const created = await repo.create(payload);
      return created;
    },

    // Update employee: admin full update; employee limited fields for self
    async updateEmployee(_, { id, input }, { auth, repo }) {
      if (!auth?.user) throw new Error('Authentication required');
      const isAdmin = auth.user.role === 'admin';
      const isSelf = auth.user.id === id;

      if (!isAdmin && !isSelf) {
        throw new Error('Not authorized to update this record');
      }

      let update = { ...input };
      if (!isAdmin && isSelf) {
        // Restrict fields
        update = Object.fromEntries(
          Object.entries(update).filter(([k]) => EMPLOYEE_SELF_UPDATABLE.has(k))
        );
      }

      const updated = await repo.updateById(id, update);
      return updated;
    },

    // Admin-only
    async deleteEmployee(_, { id }, { auth, repo }) {
      ensureAdmin(auth);
      await repo.deleteById(id);
      return true;
    },

    // Login: returns JWT and user
    async login(_, { email, password }, { repo }) {
      const user = await repo.findByEmail(email);
      if (!user) throw new Error('Invalid credentials');

      if (user.passwordHash) {
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) throw new Error('Invalid credentials');
      } else {
        // If for some reason not hashed (memory seed), accept default password
        if (password !== 'password123') throw new Error('Invalid credentials');
      }

      const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
        expiresIn: '2h',
      });
      return {
        token,
        user: { id: user.id, name: user.name, role: user.role },
      };
    },
  },
};