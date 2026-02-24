export const PROJECT_ROLES = {
  OWNER: 1,
  MANAGER: 2,
  CONTRIBUTOR: 3,
  STAKEHOLDER: 4
}

export const ROLE_CONFIG = {
  [PROJECT_ROLES.OWNER]: { label: 'Owner', color: 'text-red-400 border-red-400/30 bg-red-400/10' },
  [PROJECT_ROLES.MANAGER]: { label: 'Manager', color: 'text-blue-400 border-blue-400/30 bg-blue-400/10' },
  [PROJECT_ROLES.CONTRIBUTOR]: { label: 'Contributor', color: 'text-green-400 border-green-400/30 bg-green-400/10' },
  [PROJECT_ROLES.STAKEHOLDER]: { label: 'Stakeholder', color: 'text-slate-400 border-slate-400/30 bg-slate-400/10' }
}