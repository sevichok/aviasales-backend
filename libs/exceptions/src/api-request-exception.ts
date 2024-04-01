import { BadRequestException } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import {ErrorCodes} from "./enums/error-codes.enum";

export class ApiRequestException extends BadRequestException {
  constructor(errorCode: ErrorCodes, errors: object) {
    const i18n = I18nContext.current();
    const message = i18n.t(errorCode);
    super({ message, errors });
  }
}
