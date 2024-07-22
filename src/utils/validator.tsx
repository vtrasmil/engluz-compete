import { type z } from "zod";
import {env} from "~/env.mjs";

// https://zod.dev/?id=inferring-the-inferred-type

/*export function parseData<T extends z.ZodTypeAny>(data: unknown, schema: T): z.infer<T> {
    return schema.parse(data);
}*/

// from https://laniewski.me/blog/2023-11-19-api-response-validation-with-zod/

interface ValidateConfig<T extends z.ZodTypeAny> {
    dto: unknown;
    schema: T;
    schemaName: string;
}

export function validateSchema<T extends z.ZodTypeAny>(
    config: ValidateConfig<T>
) {
    const parsed = config.schema.safeParse(config.dto);
    if (parsed.success) {
        return parsed.data as z.infer<T>;
    } else {
        captureError(`API Validation Error: ${config.schemaName}`, {
            dto: config.dto,
            error: parsed.error.message,
            issues: parsed.error.issues,
        });
        throw parsed.error;
    }
}



function captureError(message: string, extra = {}): void {
    if (env.VERCEL_ENV == 'development') {
        console.error(message, extra);
    } else {
        // TODO: report to Sentry/something else
        throw new Error(message);
    }
}


