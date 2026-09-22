import { userService } from '../services/userService';
import { IUser } from '../models/IUser';
import { ApiError } from '../models/IApiError';

export type CurrentUserResult =
  | { state: 'resolved'; user: IUser }
  | { state: 'not-registered' }
  | { state: 'error'; message: string };

export async function resolveCurrentUser(employeeObjectId: string | undefined): Promise<CurrentUserResult> {
  if (!employeeObjectId) {
    return { state: 'error', message: 'Signed-in user identity is not available in this context.' };
  }

  try {
    const user = await userService.getByEmployeeObjectId(employeeObjectId);
    return { state: 'resolved', user };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { state: 'not-registered' };
    }
    return { state: 'error', message: err instanceof Error ? err.message : 'Failed to resolve current user.' };
  }
}
