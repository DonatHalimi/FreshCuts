import crypto from 'node:crypto';

export function requestId(req, res, next) {
    const id = req.get('X-Request-Id') || crypto.randomUUID();
    req.requestId = id;
    res.setHeader('X-Request-Id', id);
    next();
}
