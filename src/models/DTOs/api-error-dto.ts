import { ValidationError } from "elysia/error";

export interface ApiErrorDto {
  errorMessage: string;
  verboseErrorMessage?: Readonly<ValidationError> | string;
}
