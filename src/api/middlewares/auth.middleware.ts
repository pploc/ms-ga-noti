import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../../shared/errors';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    roles?: string[];
  };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  // GymAPI Gateway pattern: pass identity in headers
  const userId = req.headers['x-user-id'] as string;
  const rolesStr = req.headers['x-user-roles'] as string;

  if (!userId) {
    // Fallback or strict error
    next(new UnauthorizedError('Missing x-user-id header. Authentication required'));
    return;
  }

  req.user = {
    id: userId,
    roles: rolesStr ? rolesStr.split(',') : [],
  };

  next();
};

export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user?.roles?.includes(role)) {
      next(new ForbiddenError(`Requires role: ${role}`));
      return;
    }
    next();
  };
};
