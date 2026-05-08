import jwt from "jsonwebtoken";

const protect = async (
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
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      req.user = decoded.id;

      next();
    } catch (error) {
      res.status(401).json({
        message: "Invalid Token",
      });
    }
  } else {
    res.status(401).json({
      message: "No Token",
    });
  }
};

export default protect;