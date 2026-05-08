import jwt from "jsonwebtoken";

const protect = (
  req,
  res,
  next
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith(
      "Bearer"
    )
  ) {
    token =
      req.headers.authorization.split(
        " "
      )[1];

    try {
      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      req.user =
        decoded.id;

      next();
    } catch (error) {
      res.status(401).json({
        message:
          "Invalid token",
      });
    }
  } else {
    res.status(401).json({
      message:
        "No token",
    });
  }
};

export default protect;