const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

module.exports.verifyToken = (event, context, callback) => {
  const token = event.headers.Authorization;

  if (!token) {
    return callback(null, {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return callback(null, {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized" }),
      });
    }

    context.user = decoded;
    callback(null, true);
  });
};
