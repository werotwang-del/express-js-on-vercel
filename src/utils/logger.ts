import winston from "winston";
import { isProd } from "@/config/env";

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    isProd
        ? winston.format.json()
        : winston.format.printf(({ level, message, timestamp, stack }) => {
              const text = stack || message;
              return `${timestamp} [${level}] ${text}`;
          }),
);

export const logger = winston.createLogger({
    level: isProd ? "info" : "debug",
    format: logFormat,
    transports: [
        new winston.transports.Console({
            format: isProd ? logFormat : winston.format.combine(winston.format.colorize(), logFormat),
        }),
    ],
});
