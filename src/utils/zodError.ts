import { ZodError } from "zod";

export function formatZodError(err: ZodError) {
    return err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
    }));
}
