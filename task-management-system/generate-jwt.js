const jwt = require("jsonwebtoken");

const payload = {
  user: "testUser",
};
const secret = "my_jwt_secret";

const token = jwt.sign(payload, secret, { expiresIn: "1h" });

console.log("Generated JWT Token:", token);
