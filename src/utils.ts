import { FikenApiError } from "./client.js";
import { logger } from "./logger.js";

type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

const SAFE_STATUS_MESSAGES: Record<number, string> = {
  400: "Bad request",
  401: "Authentication failed",
  403: "Access denied",
  404: "Resource not found",
  429: "Rate limit exceeded",
  500: "Internal server error",
  502: "Bad gateway",
  503: "Service unavailable",
};

function sanitizeApiError(error: FikenApiError): string {
  const safeMessage = SAFE_STATUS_MESSAGES[error.status] ?? error.statusText;
  logger.warn("api_error", { status: error.status, statusText: error.statusText, body: error.body });
  return `Fiken API error (${error.status}): ${safeMessage}`;
}

export function wrapToolError(
  handler: (args: unknown) => Promise<ToolResult>
): (args: unknown) => Promise<ToolResult> {
  return async (args: unknown) => {
    try {
      return await handler(args);
    } catch (error) {
      let message: string;
      if (error instanceof FikenApiError) {
        message = sanitizeApiError(error);
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
