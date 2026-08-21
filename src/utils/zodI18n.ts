import { z } from "zod";

const typeNames: Record<string, string> = {
    string: "字符串",
    number: "数字",
    boolean: "布尔值",
    bigint: "BigInt",
    date: "日期",
    undefined: "undefined",
    null: "null",
    array: "数组",
    object: "对象",
    function: "函数",
    symbol: "Symbol",
    map: "Map",
    set: "Set",
    nan: "NaN",
    promise: "Promise",
    void: "void",
    unknown: "unknown",
    any: "any",
};

function typeLabel(t: string): string {
    return typeNames[t] ?? t;
}

export const zodErrorMap: z.ZodErrorMap = (issue, ctx) => {
    switch (issue.code) {
        case "invalid_type": {
            if (issue.received === "undefined") return { message: "该字段为必填项" };
            return { message: `类型错误：期望 ${typeLabel(issue.expected)}，实际为 ${typeLabel(issue.received)}` };
        }
        case "invalid_literal":
            return { message: `仅接受字面量 ${JSON.stringify(issue.expected)}` };
        case "custom":
            return { message: issue.message || ctx.defaultError };
        case "invalid_union":
            return { message: "输入不匹配任何允许的格式" };
        case "invalid_union_discriminator":
            return { message: `无效的判别值，期望其中之一：${issue.options.map((o) => JSON.stringify(o)).join("、")}` };
        case "invalid_enum_value":
            return { message: `无效的枚举值，允许的值：${issue.options.map((o) => JSON.stringify(o)).join("、")}` };
        case "unrecognized_keys":
            return { message: `存在未识别的字段：${issue.keys.join("、")}` };
        case "invalid_arguments":
            return { message: "函数参数无效" };
        case "invalid_return_type":
            return { message: "函数返回值无效" };
        case "invalid_date":
            return { message: "无效的日期格式" };
        case "invalid_string": {
            switch (issue.validation) {
                case "email":
                    return { message: "邮箱格式不正确" };
                case "uuid":
                    return { message: "UUID 格式不正确" };
                case "url":
                    return { message: "URL 格式不正确" };
                case "regex":
                    return { message: "格式不正确" };
                case "ip":
                    return { message: "IP 地址格式不正确" };
                case "datetime":
                    return { message: "日期时间格式不正确" };
                case "date":
                    return { message: "日期格式不正确" };
                case "time":
                    return { message: "时间格式不正确" };
                case "duration":
                    return { message: "时长格式不正确" };
                default:
                    return { message: "字符串格式不正确" };
            }
        }
        case "too_small": {
            const type = issue.type;
            const min = issue.minimum;
            if (type === "string" || type === "array")
                return { message: issue.exact ? `长度必须为 ${min}` : `长度不能小于 ${min}` };
            if (type === "number" || type === "bigint")
                return { message: `数值不能小于 ${min}` };
            return { message: `不能小于 ${min}` };
        }
        case "too_big": {
            const type = issue.type;
            const max = issue.maximum;
            if (type === "string" || type === "array")
                return { message: issue.exact ? `长度必须为 ${max}` : `长度不能大于 ${max}` };
            if (type === "number" || type === "bigint")
                return { message: `数值不能大于 ${max}` };
            return { message: `不能大于 ${max}` };
        }
        case "invalid_intersection_types":
            return { message: "交集类型校验失败" };
        case "not_multiple_of":
            return { message: `必须是 ${issue.multipleOf} 的倍数` };
        case "not_finite":
            return { message: "必须是有限的数值" };
        default:
            return { message: ctx.defaultError || "校验失败" };
    }
};

export function initZodI18n(): void {
    z.setErrorMap(zodErrorMap);
}
