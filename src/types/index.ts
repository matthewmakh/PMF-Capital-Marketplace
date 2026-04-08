import { UserRole } from "@prisma/client";

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isHidden: boolean;
}
