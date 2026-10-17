import prisma from '../database/prisma.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';
import * as authService from '../services/auth.service.js';

async function deleteRecords(model, ids, actorUserId) {
    try {
        await prisma.$transaction(async (tx) => {
            const records = await tx[model].findMany({
                where: { id: { in: ids } },
                select: { id: true },
            });
            if (records.length !== ids.length) {
                throw new AppError(404, 'NOT_FOUND', 'One or more selected records could not be found');
            }

            if (model === 'user' && ids.includes(actorUserId)) {
                throw new AppError(422, 'SELF_DELETE_NOT_ALLOWED', 'You cannot delete your own admin account');
            }

            const appointmentWhere = model === 'provider'
                ? { providerId: { in: ids } }
                : model === 'service'
                    ? { serviceId: { in: ids } }
                    : { customerId: { in: ids } };
            const appointments = await tx.appointment.count({ where: appointmentWhere });
            if (appointments) {
                const entity = model === 'provider' ? 'barber' : `${model}${model === 'service' ? '' : ' account'}`;
                throw new AppError(409, 'RECORD_IN_USE', `Selected ${entity} records with appointment history cannot be deleted`);
            }

            if (model === 'user') {
                const timeOff = await tx.timeOff.count({ where: { createdById: { in: ids } } });
                if (timeOff) {
                    throw new AppError(409, 'RECORD_IN_USE', 'Selected user accounts that created staff time off cannot be deleted');
                }
                const linkedProviders = await tx.provider.count({ where: { userId: { in: ids } } });
                if (linkedProviders) {
                    throw new AppError(409, 'RECORD_IN_USE', 'Selected user accounts linked to barber profiles cannot be deleted');
                }
            }

            await tx[model].deleteMany({ where: { id: { in: ids } } });
        });
    } catch (error) {
        if (error.code === 'P2003') {
            throw new AppError(409, 'RECORD_IN_USE', 'Selected records are still referenced and cannot be deleted');
        }
        throw error;
    }
}

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
    const rows = await prisma.user.findMany({ select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, emailVerifiedAt: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 100 });
    return sendSuccess(res, 200, rows);
}

export async function createUser(req, res) {
    const user = await authService.register(req.body, req.body.role);
    return sendSuccess(res, 201, user);
}

export async function deleteUser(req, res) {
    await deleteRecords('user', [req.params.id], req.auth.userId);
    return sendSuccess(res, 200, { deleted: 1 });
}

export async function bulkDeleteUsers(req, res) {
    await deleteRecords('user', req.body.ids, req.auth.userId);
    return sendSuccess(res, 200, { deleted: req.body.ids.length });
}

export async function appointments(req, res) {
    const { q = '', status } = req.validatedQuery;
    const rows = await prisma.appointment.findMany({
        where: {
            ...(status ? { status } : {}),
            ...(q ? {
                OR: [
                    { customer: { firstName: { contains: q, mode: 'insensitive' } } },
                    { customer: { lastName: { contains: q, mode: 'insensitive' } } },
                    { customer: { email: { contains: q, mode: 'insensitive' } } },
                    { provider: { name: { contains: q, mode: 'insensitive' } } },
                    { serviceNameSnapshot: { contains: q, mode: 'insensitive' } },
                ],
            } : {}),
        },
        select: {
            id: true,
            scheduledStartAt: true,
            scheduledEndAt: true,
            serviceNameSnapshot: true,
            durationMinSnapshot: true,
            priceCentsSnapshot: true,
            status: true,
            customer: { select: { id: true, firstName: true, lastName: true, email: true } },
            provider: { select: { id: true, name: true } },
        },
        orderBy: { scheduledStartAt: 'desc' },
        take: 200,
    });
    return sendSuccess(res, 200, rows);
}

async function deleteAppointments(ids) {
    await prisma.$transaction(async (tx) => {
        const rows = await tx.appointment.findMany({
            where: { id: { in: ids } },
            select: { id: true },
        });
        if (rows.length !== ids.length) {
            throw new AppError(404, 'NOT_FOUND', 'One or more selected appointments could not be found');
        }
        await tx.appointment.deleteMany({ where: { id: { in: ids } } });
    });
}

export async function deleteAppointment(req, res) {
    await deleteAppointments([req.params.id]);
    return sendSuccess(res, 200, { deleted: 1 });
}

export async function bulkDeleteAppointments(req, res) {
    await deleteAppointments(req.body.ids);
    return sendSuccess(res, 200, { deleted: req.body.ids.length });
}

export async function updateAppointmentStatus(req, res) {
    const appointment = await prisma.$transaction(async (tx) => {
        const current = await tx.appointment.findUnique({
            where: { id: req.params.id },
            include: { customer: true, provider: true },
        });
        const updated = await tx.appointment.update({
            where: { id: req.params.id },
            data: { status: req.body.status },
            select: {
                id: true,
                scheduledStartAt: true,
                scheduledEndAt: true,
                serviceNameSnapshot: true,
                durationMinSnapshot: true,
                priceCentsSnapshot: true,
                status: true,
                customer: { select: { id: true, firstName: true, lastName: true, email: true } },
                provider: { select: { id: true, name: true } },
            },
        });
        if (current.status !== req.body.status && req.body.status === 'CANCELLED') {
            await tx.emailOutbox.create({
                data: {
                    type: 'APPOINTMENT_CANCELLED',
                    toEmail: current.customer.email,
                    payload: {
                        firstName: current.customer.firstName,
                        providerName: current.provider.name,
                        serviceName: current.serviceNameSnapshot,
                        startAt: current.scheduledStartAt.toISOString(),
                    },
                },
            });
            await tx.notification.create({
                data: {
                    userId: current.customerId,
                    type: 'APPOINTMENT_CANCELLED',
                    title: 'Appointment cancelled',
                    message: `${current.serviceNameSnapshot} with ${current.provider.name} was cancelled by the shop.`,
                    link: `/account/appointments/${current.id}`,
                    metadata: { appointmentId: current.id },
                },
            });
        }
        return updated;
    });
    return sendSuccess(res, 200, appointment);
}

export async function services(_req, res) {
    const rows = await prisma.service.findMany({ orderBy: { name: 'asc' } });
    return sendSuccess(res, 200, rows);
}

export async function createService(req, res) {
    const service = await prisma.service.create({
        data: req.body,
    });
    return sendSuccess(res, 201, service);
}

export async function deleteService(req, res) {
    await deleteRecords('service', [req.params.id], req.auth.userId);
    return sendSuccess(res, 200, { deleted: 1 });
}

export async function bulkDeleteServices(req, res) {
    await deleteRecords('service', req.body.ids, req.auth.userId);
    return sendSuccess(res, 200, { deleted: req.body.ids.length });
}

export async function providers(_req, res) {
    const rows = await prisma.provider.findMany({
        select: {
            id: true,
            name: true,
            title: true,
            bio: true,
            isActive: true,
            services: { select: { service: { select: { id: true, name: true } } } },
            user: { select: { email: true } },
            _count: { select: { appointments: true } },
        },
        orderBy: { name: 'asc' },
    });
    return sendSuccess(res, 200, rows);
}

export async function createProvider(req, res) {
    const { name, title, bio, serviceIds, workingDays, startMin, endMin } = req.body;
    const provider = await prisma.$transaction(async (tx) => {
        const activeServiceCount = await tx.service.count({
            where: { id: { in: serviceIds }, isActive: true },
        });
        if (activeServiceCount !== serviceIds.length) {
            throw new AppError(422, 'VALIDATION_ERROR', 'Choose active services that exist in the service catalogue');
        }
        const created = await tx.provider.create({
            data: {
                name,
                title: title || null,
                bio: bio || null,
                services: {
                    create: serviceIds.map((serviceId) => ({ service: { connect: { id: serviceId } } })),
                },
                workingHours: {
                    create: workingDays.map((dayOfWeek) => ({
                        dayOfWeek,
                        startMin,
                        endMin,
                        isActive: true,
                    })),
                },
                breaks: {
                    create: workingDays.map((dayOfWeek) => ({
                        dayOfWeek,
                        startMin: 780,
                        endMin: 840,
                        label: 'Lunch',
                    })),
                },
            },
            select: {
                id: true,
                name: true,
                title: true,
                bio: true,
                isActive: true,
                services: { select: { service: { select: { id: true, name: true } } } },
                user: { select: { email: true } },
                _count: { select: { appointments: true } },
            },
        });
        return created;
    });
    return sendSuccess(res, 201, provider);
}

export async function deleteProvider(req, res) {
    await deleteRecords('provider', [req.params.id], req.auth.userId);
    return sendSuccess(res, 200, { deleted: 1 });
}

export async function bulkDeleteProviders(req, res) {
    await deleteRecords('provider', req.body.ids, req.auth.userId);
    return sendSuccess(res, 200, { deleted: req.body.ids.length });
}

export async function updateProvider(req, res) {
    const data = {};
    for (const key of ['name', 'title', 'bio', 'isActive']) {
        if (key in req.body) data[key] = req.body[key] || (key === 'title' || key === 'bio' ? null : req.body[key]);
    }
    const provider = await prisma.provider.update({
        where: { id: req.params.id },
        data,
        select: {
            id: true,
            name: true,
            title: true,
            bio: true,
            isActive: true,
            services: { select: { service: { select: { id: true, name: true } } } },
            user: { select: { email: true } },
            _count: { select: { appointments: true } },
        },
    });
    return sendSuccess(res, 200, provider);
}

export async function updateUser(req, res) {
    const user = await authService.updateAdminUser(req.params.id, req.body);
    return sendSuccess(res, 200, user);
}

export async function updateService(req, res) {
    const data = {};
    for (const key of ['name', 'description', 'durationMin', 'priceCents', 'bufferBeforeMin', 'bufferAfterMin', 'isActive']) if (key in req.body) data[key] = req.body[key];
    const service = await prisma.service.update({ where: { id: req.params.id }, data });
    return sendSuccess(res, 200, service);
}
