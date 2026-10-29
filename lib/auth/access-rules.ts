export type SpaceManagementAccess = {
  canManageSpaces: boolean
}

export function assertCanManageSpaces(access: SpaceManagementAccess) {
  if (!access.canManageSpaces) throw new Error('Sem permissões de gestor de espaço')
}
