export const ROUTES = {
  LOGIN: '/login',
  HOME: '/',
  DASHBOARD: '/dashboard',
  DASHBOARD_EVENTS: '/dashboard/events',
  DASHBOARD_ISSUE_REPORTING: '/dashboard/issue-reporting',
  /** @param {string} issueId */
  civilianIssueDetail: (issueId) => `/dashboard/issue-reporting/${issueId}`,
  DASHBOARD_GARBAGE_COLLECTORS: '/dashboard/garbage-collectors',
  DASHBOARD_ABOUT: '/dashboard/about',
  DASHBOARD_RECYCLING_CENTERS: '/dashboard/recycling-centers',
  REGISTER_CIVILIAN: '/register/civilian',
  REGISTER_ORGANIZATION: '/register/organization',
  CIVILIAN_PROFILE: '/dashboard/profile',
  ORGANIZATION_PROFILE: '/organization/profile',
  ORGANIZATION_REQUESTS: '/organization/requests',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USER_MANAGEMENT: '/admin/users',
  ADMIN_EVENT_MANAGEMENT: '/admin/events',
  /** @param {string} eventId */
  adminEventDetail: (eventId) => `/admin/events/${eventId}`,
  ADMIN_RECYCLING_CENTERS: '/admin/recycling-centers',
  ADMIN_PICKUP_REQUESTS: '/admin/pickup-requests',
  ADMIN_ISSUE_MANAGEMENT: '/admin/issues',
  /** @param {string} issueId */
  adminIssueDetail: (issueId) => `/admin/issues/${issueId}`,
  ORGANIZATION_LAYOUT: '/organization',
  ORGANIZATION_DASHBOARD: '/organization/dashboard',
  ORGANIZATION_EVENTS: '/organization/events',
  ORGANIZATION_NOTIFICATIONS: '/organization/notifications',
  ORGANIZATION_EXPLORE_EVENTS: '/organization/explore-events',
  DASHBOARD_NOTIFICATIONS: '/dashboard/notifications'
}
