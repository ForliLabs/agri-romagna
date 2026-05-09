import {
  dataIsolationRulesStore,
  defaultCooperativeId,
  getActiveSessions,
  getAuditLog,
  permissionsStore,
  rolesStore,
} from "@/lib/rbac-data";
import { withAuth } from "@/lib/api-response";

export const GET = withAuth("rbac:read", async () => {
  const [storedRoles, storedPermissions, isolationRules] = await Promise.all([
    rolesStore.findAll(),
    permissionsStore.findAll(),
    dataIsolationRulesStore.findAll(),
  ]);

  return Response.json({
    roles: storedRoles.map((role) => ({
      role: role.role,
      label: role.label,
      description: role.description,
      permissions: role.permissions,
      level: role.level,
    })),
    permissions: storedPermissions,
    auditLog: getAuditLog(defaultCooperativeId),
    sessions: getActiveSessions(defaultCooperativeId),
    isolationRules,
  });
});
