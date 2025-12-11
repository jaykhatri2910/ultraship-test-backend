export function requireAdmin(ctx) {
  if (!ctx?.auth?.user || ctx.auth.user.role !== 'admin') {
    throw new Error('Admin privileges required');
  }
}

export function requireAuth(ctx) {
  if (!ctx?.auth?.user) throw new Error('Authentication required');
}