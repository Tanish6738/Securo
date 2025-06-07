// Custom validation middleware without express-validator

// Validation middleware
export const handleValidationErrors = (req, res, next) => {
  if (req.validationErrors && req.validationErrors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: req.validationErrors
    });
  }
  next();
};

// Validation rules for email creation
export const validateEmailCreation = (req, res, next) => {
  const errors = [];
  const { customName } = req.body;

  if (customName !== undefined) {
    if (typeof customName !== 'string') {
      errors.push({ field: 'customName', message: 'Custom name must be a string' });
    } else if (customName.length > 20) {
      errors.push({ field: 'customName', message: 'Custom name must be 20 characters or less' });
    } else if (!/^[a-zA-Z0-9]*$/.test(customName)) {
      errors.push({ field: 'customName', message: 'Custom name can only contain alphanumeric characters' });
    }
  }

  req.validationErrors = errors;
  next();
};

// Validation rules for token parameter
export const validateToken = (req, res, next) => {
  const errors = [];
  const { token } = req.query;

  if (!token) {
    errors.push({ field: 'token', message: 'Token is required' });
  } else if (token.length < 10) {
    errors.push({ field: 'token', message: 'Token must be at least 10 characters' });
  }

  req.validationErrors = errors;
  next();
};

// Validation rules for email ID parameter
export const validateEmailId = (req, res, next) => {
  const errors = [];
  const { emailId } = req.params;

  if (!emailId) {
    errors.push({ field: 'emailId', message: 'Email ID is required' });
  } else if (emailId.length < 1) {
    errors.push({ field: 'emailId', message: 'Email ID must not be empty' });
  }

  req.validationErrors = errors;
  next();
};
