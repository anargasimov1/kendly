export const errorHandler = (err, req, res, next) => {
  const correlationId = req.correlationId || 'N/A';
  console.error(`[Error] ${correlationId} - ${err.message}`);

  // Zod validasiya xətaları (əgər hələ də middleware catherindən keçibsə)
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validasiya xətası', details: err.errors, correlationId });
  }

  // Sequelize unikal açar xətaları
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Bənzərsizlik (Unique) xətası',
      details: err.errors[0]?.message,
      correlationId,
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'DB Validasiya xətası',
      details: err.errors[0]?.message,
      correlationId,
    });
  }

  // Sequelize xarici açar xətaları
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Əlaqə xətası (Foreign Key)',
      details: err.parent?.detail,
      correlationId,
    });
  }

  // JWT xətaları
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Yanlış və ya vaxtı keçmiş token', correlationId });
  }

  // Özəl xətalar e.g xidmətdən gələn
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Daxili server xətası',
    correlationId,
  });
};
