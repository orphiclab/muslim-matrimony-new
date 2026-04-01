import * as Joi from 'joi';

/**
 * Joi schema for environment variable validation.
 * The app will REFUSE TO START if any required variable is missing or malformed.
 * This prevents silent runtime failures from misconfigured deployments.
 */
export const envValidationSchema = Joi.object({
  // ── Required ──────────────────────────────────────────────────────
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required().messages({
    'string.uriCustomScheme': 'DATABASE_URL must be a valid postgresql:// connection string',
    'any.required': 'DATABASE_URL is required — set it to your PostgreSQL connection string',
  }),

  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET must be at least 32 characters long for security',
    'any.required': 'JWT_SECRET is required — never leave this undefined in production',
  }),

  // ── Optional with defaults ─────────────────────────────────────────
  PORT: Joi.number().integer().min(1).max(65535).default(3002),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  // ── Optional — only required when Stripe is enabled ───────────────
  STRIPE_SECRET_KEY: Joi.string().optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),

  // ── Optional — CORS ───────────────────────────────────────────────
  FRONTEND_URL: Joi.string().uri().optional().default('http://localhost:3001'),
});
