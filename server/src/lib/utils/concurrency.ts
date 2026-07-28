export async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit = 5,
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = [];
  let i = 0;

  const workers = Array.from(
    { length: Math.min(limit, tasks.length) },
    async () => {
      while (i < tasks.length) {
        const idx = i++;
        const task = tasks[idx];
        results[idx] = await Promise.resolve(task()).then(
          (value) => ({ status: "fulfilled", value }) as const,
          (reason) => ({ status: "rejected", reason }) as const,
        );
      }
    },
  );

  await Promise.all(workers);
  return results;
}
