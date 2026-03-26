import { FikenApiError, FikenClient } from "./client.js";

type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

export function wrapToolError(
  handler: (args: unknown) => Promise<ToolResult>
): (args: unknown) => Promise<ToolResult> {
  return async (args: unknown) => {
    try {
      return await handler(args);
    } catch (error) {
      let message: string;
      if (error instanceof FikenApiError) {
        message = `Fiken API error ${error.status} ${error.statusText}: ${error.body}`;
      } else if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      return {
        content: [{ type: "text", text: message }],
        isError: true,
      };
    }
  };
}

export function toText(data: unknown): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

interface ParseableSchema<T = unknown> {
  parse(data: unknown): T;
}

/** Handler for GET-single-item tools (client.get). */
export function getHandler<T>(
  client: FikenClient,
  schema: ParseableSchema<T>,
  pathFn: (parsed: T) => string,
  paramsFn?: (parsed: T) => Record<string, string | number | boolean | undefined>
): (args: unknown) => Promise<ToolResult> {
  return wrapToolError(async (args: unknown) => {
    const parsed = schema.parse(args);
    const data = await client.get(pathFn(parsed), paramsFn?.(parsed));
    return toText(data);
  });
}

/** Handler for paginated list tools (client.getPaginated). */
export function listHandler<T>(
  client: FikenClient,
  schema: ParseableSchema<T>,
  pathFn: (parsed: T) => string
): (args: unknown) => Promise<ToolResult> {
  return wrapToolError(async (args: unknown) => {
    const parsed = schema.parse(args);
    const { companySlug, page, pageSize, ...filters } = parsed as Record<string, unknown>;
    const data = await client.getPaginated(
      pathFn(parsed),
      { page, pageSize } as { page?: number; pageSize?: number },
      filters as Record<string, string | number | boolean | undefined>
    );
    return toText(data);
  });
}
