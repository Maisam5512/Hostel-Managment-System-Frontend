export const ROLES = {
  ADMIN: 'ADMIN',
  ACCOUNTANT: 'ACCOUNTANT',
  MEMBER: 'MEMBER',
  MESS_INCHARGE: 'MESS_INCHARGE',
  SECURITY: 'SECURITY',
  MANAGER: 'MANAGER',
  WARDEN: 'WARDEN',
};

export const ROLE_NAMES = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.ACCOUNTANT]: 'Accountant',
  [ROLES.MEMBER]: 'Member',
  [ROLES.MESS_INCHARGE]: 'Mess Incharge',
  [ROLES.SECURITY]: 'Security',
   [ROLES.MANAGER]: 'Manager',
    [ROLES.WARDEN]: 'Warden',
};

// Default route for each role – used after login and on dashboard 403
export const DEFAULT_ROUTES = {
  [ROLES.ADMIN]: '/dashboard',
  [ROLES.ACCOUNTANT]: '/bills',
  [ROLES.MEMBER]: '/dashboard',        // member dashboard shows only self info
  [ROLES.MESS_INCHARGE]: '/food-orders',
  [ROLES.SECURITY]: '/visitors',
  [ROLES.MANAGER]: '/dashboard',
  [ROLES.WARDEN]: '/bedAssignments',
};



export const ROLE_CODE_MAP = {
  // Exact matches (case‑insensitive)
  'admin': ROLES.ADMIN,
  'administrator': ROLES.ADMIN,
  'accountant': ROLES.ACCOUNTANT,
  'member': ROLES.MEMBER,
  'mess incharge': ROLES.MESS_INCHARGE,
  'mess_incharge': ROLES.MESS_INCHARGE,
  'security': ROLES.SECURITY,
  'manager': ROLES.MANAGER,
  'warden': ROLES.WARDEN,
  // Add any other variations you observe from your backend
};