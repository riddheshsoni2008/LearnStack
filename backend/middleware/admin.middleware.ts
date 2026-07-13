import { Request, Response, NextFunction } from 'express';

// Admin-only middleware - must be used AFTER auth middleware
const admin = (req: Request, res: Response, next: NextFunction): any => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
};

export { admin };
