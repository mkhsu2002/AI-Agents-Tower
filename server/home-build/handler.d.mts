export function handleHomeBuild(
  request: Request,
  env?: Record<string, unknown>,
  planner?: (brief: unknown, answer: string | undefined, canAsk: boolean) => Promise<unknown>,
): Promise<Response>;
