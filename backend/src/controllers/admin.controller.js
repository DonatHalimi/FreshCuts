import prisma from '../../database/prisma.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError } from '../../utils/AppError.js';

export async function dashboard(_req, res) {
    const now = new Date();
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const [appointments, revenue, users, providers, services] = await Promise.all([
        prisma.appointment.count({ where: { scheduledStartAt: { gte: start, lt: end } } }),
        prisma.appointment.aggregate({ where: { scheduledStartAt: { gte: start, lt: end }, status: 'COMPLETED' }, _sum: { priceCentsSnapshot: true } }),
        prisma.user.count(),
        prisma.provider.count({ where: { isActive: true } }),
        prisma.service.count({ where: { isActive: true } }),
    ]);
    return sendSuccess(res, 200, { appointmentsToday: appointments, revenueTodayCents: revenue._sum.priceCentsSnapshot ?? 0, users, providers, services });
}

export async function users(_req, res) {
    const rows = await prisma.user.findMany({ select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, emailVerifiedAt: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 100 });
    return sendSuccess(res, 200, rows);
}

export async function services(_req, res) {
    const rows = await prisma.service.findMany({ orderBy: { name: 'asc' } });
    return sendSuccess(res, 200, rows);
}

export async function updateUser(req, res) {
    const allowedRoles = ['CLIENT', 'PROVIDER', 'ADMIN'];
    if (req.body.role && !allowedRoles.includes(req.body.role)) throw new AppError(422, 'VALIDATION_ERROR', 'Invalid role');
    const data = {};
    for (const key of ['firstName', 'lastName', 'phone', 'role', 'isActive']) if (key in req.body) data[key] = req.body[key];
    const user = await prisma.user.update({ where: { id: req.params.id }, data, select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true } });
    return sendSuccess(res, 200, user);
}

export async function updateService(req, res) {
    const data = {};
    for (const key of ['name', 'description', 'durationMin', 'priceCents', 'bufferBeforeMin', 'bufferAfterMin', 'isActive']) if (key in req.body) data[key] = req.body[key];
    const service = await prisma.service.update({ where: { id: req.params.id }, data });
    return sendSuccess(res, 200, service);
}
