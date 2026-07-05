const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Terjadi kesalahan pada server';

  // Penanganan error validasi Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Penanganan error Mongoose CastError (ID tidak valid)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource tidak ditemukan dengan format ID tidak valid.`;
  }

  // Penanganan duplicate key MongoDB
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Data sudah terdaftar di sistem';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

export default errorHandler;
