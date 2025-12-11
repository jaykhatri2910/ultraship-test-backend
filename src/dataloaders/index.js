import DataLoader from 'dataloader';

// Stub: Batching for future relations or cross-entity lookups
export default function loaders(repo) {
  return {
    employeeById: new DataLoader(async (ids) => {
      const all = await repo.findAll();
      const map = new Map(all.map((e) => [String(e.id), e]));
      return ids.map((id) => map.get(String(id)) || null);
    }),
  };
}