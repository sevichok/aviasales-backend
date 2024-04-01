import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('app', () => {
  const envVarsSchema = Joi.object()
    .keys({
      PORT: Joi.number().default(4000).required(),
      LOG_LEVEL: Joi.string()
        .valid('error', 'debug', 'warn', 'log')
        .default('warn')
        .required(),
      NODE_ENV: Joi.string()
        .valid('development', 'production')
        .default('development')
        .required(),
    })
    .unknown();
  const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    port: envVars.PORT,
    node_env: envVars.NODE_ENV,
    log_level: envVars.LOG_LEVEL,
  };
});
