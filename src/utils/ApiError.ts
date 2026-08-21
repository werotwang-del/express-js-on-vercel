export class ApiError extends Error {
    statusCode: number;
    code: string;
    details?: unknown;

    constructor(statusCode: number, message: string, code = "ERROR", details?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = "ApiError";
    }

    static badRequest(message = "Bad request", details?: unknown) {
        return new ApiError(400, message, "BAD_REQUEST", details);
    }
    static unauthorized(message = "Unauthorized") {
        return new ApiError(401, message, "UNAUTHORIZED");
    }
    static forbidden(message = "Forbidden") {
        return new ApiError(403, message, "FORBIDDEN");
    }
    static notFound(message = "Not found") {
        return new ApiError(404, message, "NOT_FOUND");
    }
    static conflict(message = "Conflict") {
        return new ApiError(409, message, "CONFLICT");
    }
    static internal(message = "Internal server error") {
        return new ApiError(500, message, "INTERNAL_ERROR");
    }
}
