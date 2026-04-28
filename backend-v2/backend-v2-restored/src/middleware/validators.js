const { body, validationResult } = require('express-validator');

// Middleware pentru validarea rezultatelor
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validare eșuată',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validatori categorie
const validateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Numele categoriei este obligatoriu')
    .isLength({ max: 50 }).withMessage('Numele nu poate depăși 50 de caractere'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Descrierea nu poate depăși 200 de caractere'),
  handleValidationErrors
];

// Validatori produs
const validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Numele produsului este obligatoriu')
    .isLength({ max: 100 }).withMessage('Numele nu poate depăși 100 de caractere'),
  body('price')
    .notEmpty().withMessage('Prețul este obligatoriu')
    .isFloat({ min: 0 }).withMessage('Prețul trebuie să fie un număr pozitiv'),
  body('category')
    .notEmpty().withMessage('Categoria este obligatorie')
    .isMongoId().withMessage('ID categorie invalid'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Descrierea nu poate depăși 500 de caractere'),
  body('preparationTime')
    .optional()
    .isInt({ min: 0 }).withMessage('Timpul de preparare trebuie să fie un număr pozitiv'),
  handleValidationErrors
];

// Validatori comandă
const validateOrder = [
  body('customer.name')
    .trim()
    .notEmpty().withMessage('Numele clientului este obligatoriu'),
  body('customer.phone')
    .trim()
    .notEmpty().withMessage('Telefonul este obligatoriu'),
  body('items')
    .isArray({ min: 1 }).withMessage('Comanda trebuie să conțină cel puțin un produs'),
  body('items.*.product')
    .notEmpty().withMessage('ID produs obligatoriu'),
  body('items.*.name')
    .trim()
    .notEmpty().withMessage('Numele produsului este obligatoriu'),
  body('items.*.quantity')
    .notEmpty().withMessage('Cantitatea este obligatorie')
    .isInt({ min: 1 }).withMessage('Cantitatea trebuie să fie cel puțin 1'),
  body('items.*.price')
    .notEmpty().withMessage('Prețul este obligatoriu')
    .isFloat({ min: 0 }).withMessage('Prețul trebuie să fie pozitiv'),
  body('totalAmount')
    .notEmpty().withMessage('Totalul este obligatoriu')
    .isFloat({ min: 0 }).withMessage('Totalul trebuie să fie pozitiv'),
  handleValidationErrors
];

// Validatori status comandă
const validateOrderStatus = [
  body('status')
    .notEmpty().withMessage('Statusul este obligatoriu')
    .isIn(['primita', 'in_preparare', 'gata', 'livrata', 'anulata'])
    .withMessage('Status invalid'),
  handleValidationErrors
];

// Validatori login
const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username este obligatoriu'),
  body('password')
    .notEmpty().withMessage('Parola este obligatorie'),
  handleValidationErrors
];

// Validatori register
const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username este obligatoriu')
    .isLength({ min: 3, max: 30 }).withMessage('Username trebuie să aibă între 3 și 30 de caractere'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email este obligatoriu')
    .isEmail().withMessage('Email invalid'),
  body('password')
    .notEmpty().withMessage('Parola este obligatorie')
    .isLength({ min: 6 }).withMessage('Parola trebuie să aibă minim 6 caractere'),
  body('role')
    .optional()
    .isIn(['admin', 'bucatarie', 'staff']).withMessage('Rol invalid'),
  handleValidationErrors
];

// Validatori schimbare parolă
const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Parola curentă este obligatorie'),
  body('newPassword')
    .notEmpty().withMessage('Noua parolă este obligatorie')
    .isLength({ min: 6 }).withMessage('Noua parolă trebuie să aibă minim 6 caractere'),
  handleValidationErrors
];

module.exports = {
  validateCategory,
  validateProduct,
  validateOrder,
  validateOrderStatus,
  validateLogin,
  validateRegister,
  validateChangePassword,
  handleValidationErrors
};