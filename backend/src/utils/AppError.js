export class AppError extends Error {
  constructor(status = 500, code = 'INTERNAL_ERROR', message = 'Something went wrong', errors = undefined) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}