const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500

  res.status(statusCode)

  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(422).json({ error: err.message });
  }

  res.json({
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : null
  })
}

module.exports = errorHandler


