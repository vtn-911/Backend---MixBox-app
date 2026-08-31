import { Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { sendError } from '../utils/response';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Access denied. No token provided.', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      sendError(res, 'Access denied. Invalid token format.', 401);
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error: any) {
    sendError(res, 'Invalid or expired token.', 401, error.message);
    return;
  }
}
