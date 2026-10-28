export type Role = "CITIZEN" | "ISSUER" | "VERIFIER" | "ADMIN";

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  issuerId?: string;
}

export class AuthorizationError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code = "PERMISSION_DENIED", statusCode = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function requireRole(user: SessionUser | null, allowedRoles: Role[]): SessionUser {
  if (!user) {
    throw new AuthorizationError(
      "Authentication required. Please sign in to access this resource.",
      "UNAUTHENTICATED",
      401
    );
  }

  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError(
      `You do not have access to this page. Your role (${user.role}) cannot perform this action.`,
      "PERMISSION_DENIED",
      403
    );
  }

  return user;
}

export function assertOwnership(
  resourceOwnerId: string,
  currentUserId: string,
  resourceName = "resource"
): void {
  if (resourceOwnerId !== currentUserId) {
    throw new AuthorizationError(
      `Access denied: You do not own this ${resourceName}.`,
      "IDOR_ACCESS_DENIED",
      403
    );
  }
}
