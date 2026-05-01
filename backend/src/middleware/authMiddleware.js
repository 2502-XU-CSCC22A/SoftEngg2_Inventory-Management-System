export const authenticateUser = (req, res, next) => {
  if (!req.session.user) {
    return res.sendStatus(401);
  }

  req.user = req.session.user;
  next();
};

export const requreAdmin = (req, res, next) => {
  if (!req.user.is_admin){
    return res.status(403).json({
      error:"Unauthorized. Admin only"
    })
  }
  next();
}