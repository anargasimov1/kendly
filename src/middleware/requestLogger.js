import { v4 as uuidv4 } from 'uuid';

export const requestLogger = (req, res, next) => {
  const correlationId = uuidv4();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);

  const start = Date.now();
  console.log(`[REQ] ${correlationId} - ${req.method} ${req.url}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[RES] ${correlationId} - ${req.method} ${req.url} - Status: ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};
