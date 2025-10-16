import type { NextFunction, Request, Response } from "express";

/** Wrap async route handlers so rejected promises go to error middleware */
export const asyncWrap =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
export const asyncHandler = asyncWrap;

/** 404 for routes not found */
export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "Not Found" });
}

/** Generic error handler (never leak internals) */
export function gestionErreurs(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[api:error]", err);
  const status = typeof err?.status === "number" ? err.status : 500;
  res.status(status).json({
    error: err?.code || "INTERNAL_ERROR",
    message: status === 500 ? "Unexpected error" : err?.message || "Error",
  });
}

/** default export in case callers import the module as default */
export default { asyncWrap, notFound, gestionErreurs };