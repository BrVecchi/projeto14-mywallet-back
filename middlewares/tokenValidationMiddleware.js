export const tokenMiddleware = (req, res, next) => {
const { authorization } = req.headers;
console.log(authorization)

  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return res.sendStatus(401);
  }
  req.token = token
  next()
}