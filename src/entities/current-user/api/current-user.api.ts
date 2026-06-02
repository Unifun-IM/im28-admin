import type { HttpClient } from '@shared/api';
import { z } from 'zod';

import type { CurrentUser } from '../model/current-user.types';

const currentUserDtoSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: z.enum(['admin', 'operator'])
});

type CurrentUserDto = z.infer<typeof currentUserDtoSchema>;

function mapCurrentUserDto(dto: CurrentUserDto): CurrentUser {
  return {
    id: dto.id,
    name: dto.name,
    role: dto.role
  };
}

export async function fetchCurrentUser(client: HttpClient): Promise<CurrentUser> {
  const response = await client.get<CurrentUserDto>('/current-user');
  const parseResult = currentUserDtoSchema.safeParse(response.data);

  if (!parseResult.success) {
    throw new Error('Invalid current user payload');
  }

  return mapCurrentUserDto(parseResult.data);
}
