export const PERMISSIONS = {
  USERS_MANAGE: "users.manage",
  COLLEGES_MANAGE: "colleges.manage",
  EVENTS_CREATE: "events.create",
  EVENTS_MANAGE: "events.manage",
  EVENTS_VIEW: "events.view",
  TEAMS_CREATE: "teams.create",
  TEAMS_INVITE: "teams.invite",
  TEAMS_REGISTER: "teams.register",
  FORMS_MANAGE: "forms.manage",
  FORMS_COMPLETE: "forms.complete",
  REGISTRATIONS_VIEW: "registrations.view",
  PAYMENTS_VIEW: "payments.view",
  PAYMENTS_MANAGE: "payments.manage",
  PAYMENTS_VERIFY: "payments.verify",
  PAYMENTS_COLLECT: "payments.collect",
  ATTENDANCE_VIEW: "attendance.view",
  ATTENDANCE_MANAGE: "attendance.manage",
  RESULTS_VIEW: "results.view",
  RESULTS_MANAGE: "results.manage",
  RESULTS_SCORE: "results.score",
  CERTIFICATES_VIEW: "certificates.view",
  CERTIFICATES_MANAGE: "certificates.manage",
  CERTIFICATES_DOWNLOAD: "certificates.download",
  ANNOUNCEMENTS_WRITE: "announcements.write",
  REPORTS_VIEW: "reports.view",
  AUDIT_VIEW: "audit.view",
  ANALYTICS_VIEW: "analytics.view",
  SETTINGS_MANAGE: "settings.manage",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

/**
 * Role -> permission matrix, derived from PRD section 20.
 */
export const ROLE_PERMISSIONS: Record<string, PermissionName[]> = {
  SUPER_ADMIN: [...ALL_PERMISSIONS],
  COLLEGE_ADMIN: [
    PERMISSIONS.TEAMS_CREATE,
    PERMISSIONS.TEAMS_INVITE,
    PERMISSIONS.TEAMS_REGISTER,
    PERMISSIONS.FORMS_COMPLETE,
    PERMISSIONS.REGISTRATIONS_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.RESULTS_VIEW,
    PERMISSIONS.CERTIFICATES_DOWNLOAD,
    PERMISSIONS.REPORTS_VIEW,
  ],
  TEAM_LEADER: [
    PERMISSIONS.TEAMS_CREATE,
    PERMISSIONS.TEAMS_INVITE,
    PERMISSIONS.TEAMS_REGISTER,
    PERMISSIONS.FORMS_COMPLETE,
    PERMISSIONS.REGISTRATIONS_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.RESULTS_VIEW,
    PERMISSIONS.CERTIFICATES_DOWNLOAD,
  ],
  PARTICIPANT: [
    PERMISSIONS.FORMS_COMPLETE,
    PERMISSIONS.REGISTRATIONS_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.RESULTS_VIEW,
    PERMISSIONS.CERTIFICATES_DOWNLOAD,
  ],
  EVENT_COORDINATOR: [
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.EVENTS_MANAGE,
    PERMISSIONS.REGISTRATIONS_VIEW,
    PERMISSIONS.PAYMENTS_COLLECT,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.RESULTS_MANAGE,
    PERMISSIONS.ANNOUNCEMENTS_WRITE,
    PERMISSIONS.REPORTS_VIEW,
  ],
  STUDENT_COORDINATOR: [
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.REGISTRATIONS_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_COLLECT,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.RESULTS_MANAGE,
    PERMISSIONS.ANNOUNCEMENTS_WRITE,
    PERMISSIONS.REPORTS_VIEW,
  ],
  JUDGE: [PERMISSIONS.EVENTS_VIEW, PERMISSIONS.RESULTS_VIEW, PERMISSIONS.RESULTS_SCORE],
  ATTENDANCE_STAFF: [PERMISSIONS.ATTENDANCE_VIEW, PERMISSIONS.ATTENDANCE_MANAGE],
  FINANCE_ADMIN: [
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_MANAGE,
    PERMISSIONS.PAYMENTS_VERIFY,
    PERMISSIONS.REPORTS_VIEW,
  ],
  CERTIFICATE_ADMIN: [
    PERMISSIONS.CERTIFICATES_VIEW,
    PERMISSIONS.CERTIFICATES_MANAGE,
    PERMISSIONS.CERTIFICATES_DOWNLOAD,
    PERMISSIONS.REPORTS_VIEW,
  ],
};

export const ROLES = Object.keys(ROLE_PERMISSIONS);

/**
 * Home route per role. Pages marked with a "roadmap" placeholder route
 * until their slice is built.
 */
export function getHomeRoute(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/admin";
    case "EVENT_COORDINATOR":
      return "/coordinator";
    case "STUDENT_COORDINATOR":
      return "/coordinator";
    case "JUDGE":
      return "/judge";
    case "ATTENDANCE_STAFF":
      return "/attendance";
    case "FINANCE_ADMIN":
      return "/payments";
    case "CERTIFICATE_ADMIN":
      return "/certificates";
    case "COLLEGE_ADMIN":
      return "/college-admin";
    case "TEAM_LEADER":
      return "/dashboard";
    case "PARTICIPANT":
      return "/dashboard";
    case "ADMIN":
      return "/admin";
    default:
      return "/dashboard";
  }
}