export const ROLES = {
  ADMIN: 'ADMIN',
  ACCOUNTANT: 'ACCOUNTANT',
  MEMBER: 'MEMBER',
  MESS_INCHARGE: 'MESS_INCHARGE',
  SECURITY: 'SECURITY',
  MANAGER: 'MANAGER',
  WARDEN: 'WARDEN',
  GUEST: 'GUEST', // Naye users ke liye default
};

export const ROLE_NAMES = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.ACCOUNTANT]: 'Accountant',
  [ROLES.MEMBER]: 'Member',
  [ROLES.MESS_INCHARGE]: 'Mess Incharge',
  [ROLES.SECURITY]: 'Security',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.WARDEN]: 'Warden',
  [ROLES.GUEST]: 'Guest/New User', 
};

// Yahan humne fallback define kar diya hai
export const DEFAULT_ROUTES = {
  [ROLES.ADMIN]: '/dashboard',
  [ROLES.ACCOUNTANT]: '/bills',
  [ROLES.MEMBER]: '/dashboard',
  [ROLES.MESS_INCHARGE]: '/food-orders',
  [ROLES.SECURITY]: '/visitors',
  [ROLES.MANAGER]: '/dashboard',
  [ROLES.WARDEN]: '/bed-assignments',
  'DEFAULT': '/dashboard', // Agar role list mein na ho toh yahan jaye
};

export const ROLE_CODE_MAP = {
  'admin': ROLES.ADMIN,
  'administrator': ROLES.ADMIN,
  'accountant': ROLES.ACCOUNTANT,
  'member': ROLES.MEMBER,
  'mess incharge': ROLES.MESS_INCHARGE,
  'mess_incharge': ROLES.MESS_INCHARGE,
  'security': ROLES.SECURITY,
  'manager': ROLES.MANAGER,
  'warden': ROLES.WARDEN,
};

/**
 * Helper function jo safe route return karega
 * Isay login component mein use karein: navigate(getSafeDefaultRoute(userRole))
 */
export const getSafeDefaultRoute = (roleCode) => {
  return DEFAULT_ROUTES[roleCode] || DEFAULT_ROUTES['DEFAULT'];
};