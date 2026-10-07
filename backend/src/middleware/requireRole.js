import { AppError } from '../utils/AppError.js';

export function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.auth || !roles.includes(req.auth.role)) {
            return next(new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action'));
        }
        return next();
    };
}
