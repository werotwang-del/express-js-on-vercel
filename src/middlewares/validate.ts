import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { formatZodError } from "../utils/zodError.js";

type Source = "body" | "query" | "params";

export function validate(schemas: Partial<Record<Source, AnyZodObject>>) {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            for (const source of Object.keys(schemas) as Source[]) {
                const schema = schemas[source]!;
                const result = schema.safeParse(req[source]);
                if (!result.success) {
                    const sourceLabels: Record<Source, string> = { body: "请求体", query: "查询参数", params: "路径参数" };
                    throw ApiError.badRequest(`${sourceLabels[source]}无效`, formatZodError(result.error));
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
