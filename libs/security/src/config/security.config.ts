import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { JwtModuleOptions } from '@nestjs/jwt';

import { readFileSync } from 'fs';
import { resolve } from 'path';

export default registerAs('security', (): JwtModuleOptions => {
  const envVarsSchema = Joi.object()
    .keys({
      JWT_EXPIRES: Joi.string().valid('30d').default('30d').required(),
      NODE_ENV: Joi.string().required(),
    })
    .unknown();
  const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  const secret = readFileSync(
    resolve(
      process.cwd(),
      `./libs/security/src/config/certs/${envVars.NODE_ENV}-private.pem`,
    ),
  );

  return {
    secret,
    signOptions: {
      expiresIn: envVars.JWT_EXPIRES,
      algorithm: 'ES256',
    },
  };
});
