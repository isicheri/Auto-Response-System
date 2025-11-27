import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodError } from "zod";
import HttpError from "../httperror";

export const responseHandler =
  (method: RequestHandler) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next);
    } catch (error: unknown) {
      let exception: HttpError;

      if (error instanceof HttpError) {
        exception = error;
      } else if (error instanceof ZodError) {
        exception = new HttpError(
          "Input validation error",
          400, // Fixed: was 402 (Payment Required)
          "validation error",
          error
        );
      } else {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        exception = new HttpError(
          "Something went wrong!",
          500,
          "server error",
          errorMessage
        );
      }

      next(exception);
    }
  };