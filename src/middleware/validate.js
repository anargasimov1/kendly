export const validate = (schema) => (req, res, next) => {
  try {
    const validData = schema.parse(req.body);
    req.body = validData; // Əgər schema-da default dəyərlər varsa, onu mənimsətsin
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({ error: 'Validasiya xətası', details: formattedErrors });
    }
    next(error);
  }
};
