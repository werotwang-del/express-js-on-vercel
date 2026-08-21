import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiError } from "@/utils/ApiError";

type Source = "body" | "query" | "params";

export function validate(schemas: Partial<Record<Source, AnyZodObject>>) {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            for (const source of Object.keys(schemas) as Source[]) {
                const schema = schemas[source]!;
                const result = schema.safeParse(req[source]);
                if (!result.success) {
                    throw ApiError.badRequest(`Invalid ${source}`, formatZodError(result.error));
                }
                // overwrite with parsed (and possibly transformed) data
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (req as any)[source] = result.data;
            }
            next();
        } catch (err) {
            next(err);
        }
    };
}

function formatZodError(err: ZodError) {
    return err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
    }));
}
