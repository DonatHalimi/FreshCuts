export function getFieldError(error, field) {
  return error?.errors?.find((item) => item.field === field)?.message;
}