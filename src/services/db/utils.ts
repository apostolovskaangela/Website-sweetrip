export function nowIso(): string {
  return new Date().toISOString();
}

export function toSqlBool(value: boolean | number | null | undefined): number {
  return value ? 1 : 0;
}

export function fromSqlBool(value: unknown): boolean {
  return Number(value) === 1;
}

export function roleIdToRoleName(roleId: number): string {
  switch (roleId) {
    case 1:
      return 'ceo';
    case 2:
      return 'manager';
    case 3:
      return 'admin';
    default:
      return 'driver';
  }
}

