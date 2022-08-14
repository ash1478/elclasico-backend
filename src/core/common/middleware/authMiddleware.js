const User = require("../../modules/auth/models/userModel");
const firebase = require("firebase-admin");

function authMiddleware(request, response, next) {
    const headerToken = request.headers['X-Authorization'];

  if (!headerToken) {
    return response.status(401).send({ message: "No token provided" });
  }

  const token = headerToken;
  firebase
    .auth()
    .verifyIdToken(token)
    .then(async (user) => {
      console.log({user});
      request.user = await User.findOne({ email: user.email });
      next();
      return;
    })
    .catch(() => response.send({ message: "Could not authorize" }).status(403));
}

module.exports = authMiddleware;