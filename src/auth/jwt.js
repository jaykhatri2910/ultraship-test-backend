import jwt from 'jsonwebtoken';

export function authContext(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return { user: null };
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { user: { id: decoded.id, role: decoded.role, name: decoded.name } };
  } catch (e) {
    return { user: null };
  }
}

export function signJWT(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
}