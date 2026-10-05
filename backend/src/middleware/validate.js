export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const { value, error } = schema.validate(req[source], {
      abortEarly: false,
      convert: true,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.') || source,
        message: detail.message,
      }));
      req.validation = { value, errors };
      return next({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        errors,
      });
    }

    req[source] = value;
    return next();
  };
}