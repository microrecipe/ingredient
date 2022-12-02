import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserType } from './ingredients.interface';

export const UserPayload = createParamDecorator(
  (data: any, context: ExecutionContext): UserType => {
    const req = context.switchToHttp().getRequest();
    return {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
    };
  },
);
