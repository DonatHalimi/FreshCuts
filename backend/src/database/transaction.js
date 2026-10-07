import env from '../config/env.js';

function isRetryable(error) {
    return error?.code === 'P2034' || error?.code === '40001' || error?.message?.includes('SerializationFailure');
}

export async function withSerializableRetry(callback) {
    let lastError;

    for (let attempt = 1; attempt <= env.bookingTransactionRetries; attempt += 1) {
        try {
            return await callback();
        } catch (error) {
            lastError = error;
            if (!isRetryable(error) || attempt === env.bookingTransactionRetries) throw error;
        }
    }

    throw lastError;
}