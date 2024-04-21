import { ValidationError } from "elysia/error";

export interface ApiError {
  errorMessage: string;
  verboseErrorMessage?: Readonly<ValidationError> | string;
}
