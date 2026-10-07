import * as service from '../services/schedule.service.js';
import { sendSuccess } from '../../utils/response.js';
export const getSchedule = async (req, res) => sendSuccess(res, 200, await service.getSchedule(req.auth.userId));
export const replaceWorkingHours = async (req, res) => sendSuccess(res, 200, await service.replaceWorkingHours(req.auth.userId, req.body.entries));
export const replaceBreaks = async (req, res) => sendSuccess(res, 200, await service.replaceBreaks(req.auth.userId, req.body.entries));
export const createTimeOff = async (req, res) => sendSuccess(res, 201, await service.createTimeOff(req.auth.userId, req.body));
export const deleteTimeOff = async (req, res) => { await service.deleteTimeOff(req.auth.userId, req.params.id); return res.status(204).send(); };
