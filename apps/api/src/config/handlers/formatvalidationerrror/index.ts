import {z} from "zod";

function formatZodValidationError(parsedBody: z.ZodSafeParseError<any>) {
  const formattedErrors = parsedBody.error.issues.map((issue) => {
    return {
      path: issue.path.join('.'),
      message: issue.message,
    };
  });
  return formattedErrors;
}



export default formatZodValidationError;