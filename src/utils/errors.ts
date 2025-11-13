/**
 * Safely extract an error message from an unknown error value.
 * Handles Error instances, strings, and other types.
 */
export function GetErrorMessage(error: unknown): string {
  if(error instanceof Error) {
    return error.message;
  } else if(typeof error === "object" && error !== null && "kind" in error) {
    return String((error as {kind: unknown}).kind);
  } else if(typeof error === "string") {
    return error;
  }

  return String(error);
}

/**
 * Check if an unknown value is an Error instance
 */
export function IsError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safely log an error to console
 */
export function LogError(message: string | undefined, error: unknown): void {
  // eslint-disable-next-line no-console
  console.error((message || "Unable to process request"), error instanceof Error ? error.message : error);
}
