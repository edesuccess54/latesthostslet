

function authorize(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      // User has the required role, proceed to the next middleware or route handler
      next();
    } else {
        res.redirect("/")
    }
  };
}

module.exports = authorize