/* class HttpException extends Error {
  public status: number;
  public message: string;
  public details?: any;
  public code?: string;

  constructor(status: number, message: string, options: { 
    details?: any, 
    code?: string 
  } = {}) {
    super(message);
    this.status = status;
    this.message = message;
    this.details = options.details;
    this.code = options.code;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpException);
    }
  }

  // Common pre-defined exceptions
  static badRequest(message: string, details?: any) {
    return new HttpException(400, message, { details });
  }

  static unauthorized(message = 'Unauthorized') {
    return new HttpException(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new HttpException(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new HttpException(404, message);
  }

  static conflict(message = 'Conflict occurred') {
    return new HttpException(409, message);
  }

  static internal(message = 'Internal server error', details?: any) {
    return new HttpException(500, message, { details });
  }

  // Convert to Express response format
  toJSON() {
    return {
      success: false,
      status: this.status,
      message: this.message,
      ...(this.code && { code: this.code }),
      ...(this.details && { details: this.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}


function errorHandler(
  err: Error | HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Handle HttpException specifically
  if (err instanceof HttpException) {
    return res.status(err.status).json(err.toJSON());
  }

  // Handle other errors
  console.error('Unhandled error:', err);
  const serverError = HttpException.internal('Something went wrong');
  res.status(serverError.status).json(serverError.toJSON());
}

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    code: err.code || 'INTERNAL_ERROR'
  });
});

export default HttpException;


const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};



class ApiError extends Error {
  constructor(statusCode, message, code = 'UNKNOWN_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

function defineHandler(fn) {
  return async (req, res, next) => {
    try {
      const result = await fn(req, res, next);

      // If response has already been sent
      if (res.headersSent) return;

      // If the result is an instance of ApiError, send custom error response
      if (result instanceof ApiError) {
        res.status(result.statusCode || 500).json({
          success: false,
          code: result.code,
          message: result.message,
          details: result.details || null
        });
        return;
      }

      // Auto-detect how to send response
      if (result === undefined || result === null) {
        res.status(204).send(); // No content
      } else if (typeof result === 'string') {
        res.send(result); // Send as plain text
      } else if (typeof result === 'object') {
        // If it's a response object, use it directly (support statusCode and headers)
        if (result.statusCode && result.headers) {
          res.set(result.headers).status(result.statusCode).send(result.body || result);
        } else {
          res.json(result); // Default to JSON
        }
      } else {
        res.send(String(result)); // Fallback to string
      }
    } catch (err) {
      // Custom error handling (known errors)
      if (err instanceof ApiError) {
        res.status(err.statusCode || 500).json({
          success: false,
          code: err.code,
          message: err.message,
          details: err.details || null
        });
      } else {
        // For unknown errors (unexpected ones)
        console.error('Unexpected error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  };
}

module.exports = { defineHandler, ApiError }; */