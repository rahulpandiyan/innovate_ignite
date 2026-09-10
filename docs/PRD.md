# Product Requirements Document (PRD)

## Inter-College Event Management Platform

**Version:** 1.0
**Status:** Production Specification
**Product Type:** Web-based Event Management Platform
**Primary Users:** Super Admins, College Admins, Team Leaders, Participants, Event Coordinators, Judges, Attendance Staff, Finance Admins, Certificate Admins

---

# 1. Product Overview

The Inter-College Event Management Platform is a centralized web application for managing the complete lifecycle of an inter-college event.

The platform will manage:

**College → User → Team → Registration → Payment → Attendee ID → Event → Attendance → Results → Certificate**

The system must support multiple colleges, multiple events, team-based and individual participation, event-specific coordinators, registration management, payments, attendance, judging/results, and certificate generation.

The platform is designed for production use and must provide secure role-based access, reliable data management, auditability, and scalable event operations.

---

# 2. Goals

1. Allow colleges and participants to register for the event.
2. Allow participants to create and manage teams.
3. Allow team leaders to invite participants to teams.
4. Provide customizable registration forms.
5. Support registration payments.
6. Generate unique participant and team identifiers.
7. Provide event-specific registration management.
8. Allow coordinators to see registrations for their assigned events.
9. Provide QR-based participant identification and attendance.
10. Manage event results and winners.
11. Generate and distribute certificates.
12. Provide dashboards and reports for administrators.
13. Enforce strict role-based and scope-based access control.

---

# 3. Non-Goals

The following are intentionally outside the initial product scope:

* Food/menu management
* Food outlet/stall management
* Hotel/accommodation management
* Transportation management
* General-purpose ERP functionality
* Social networking functionality

These may be added in future versions.

---

# 4. User Roles

## 4.1 Super Admin

The Super Admin has complete access to the platform.

### Permissions

* Manage users
* Manage roles
* Manage colleges
* Manage events
* Manage event categories
* Assign coordinators
* Manage registration forms
* View all registrations
* Manage teams
* Manage participants
* Manage payments
* Manage attendance
* Manage results
* Manage certificates
* Manage announcements
* View analytics
* Export reports
* Manage system settings
* View audit logs

### Scope

Entire platform.

---

# 4.2 College Admin

The College Admin manages their college's participation.

### Permissions

* Login
* Manage college profile
* Add participants
* Manage participants belonging to their college
* Create teams
* Manage teams
* Invite participants
* Register teams for events
* Complete registration forms
* View registration status
* View payment status
* View participant IDs
* View team IDs
* View event schedules
* View attendance
* View results
* Download certificates
* Receive announcements

### Restrictions

A College Admin cannot:

* Access another college's participants
* Access another college's teams
* Modify event configuration
* Manage system-wide users
* Access unrelated administrative functionality

### Scope

Their college only.

---

# 4.3 Team Leader

The Team Leader manages their own team.

### Permissions

* Login
* Create a team
* Invite team members
* View team members
* Accept/manage invitations
* Remove team members where permitted
* Register the team for an event
* Complete registration forms
* View registration status
* Make/view payment
* View team ID
* View participant IDs
* View event information
* View attendance
* View results
* Download certificates

### Restrictions

A Team Leader cannot:

* Access another team
* Modify another team
* Access unrelated registrations
* Modify event configuration

### Scope

Their own team.

---

# 4.4 Participant / Team Member

The Participant has access to their own account and participation information.

### Permissions

* Login
* Manage personal profile
* View participant ID
* View team information
* Accept team invitations
* View registered events
* View registration information
* View payment status
* View QR/digital pass
* View attendance
* View results
* Download certificates

### Restrictions

A Participant cannot:

* Manage another participant
* Modify team ownership
* Access another team
* Modify registrations belonging to another participant

### Scope

Own account and permitted team information.

---

# 4.5 Event Coordinator

The Event Coordinator is responsible for one or more assigned events.

This role is **event-scoped**.

### Permissions

#### Event

* View assigned event
* View event details
* View venue
* View schedule
* View rules
* View registration limits
* View event status

#### Registrations

* View registrations for assigned events
* Search registrations
* Filter registrations
* View teams
* View participants
* View college information
* View registration form responses
* View registration status
* View required payment status
* Export event registrations
* View registration statistics

#### Participants

* View participants registered for assigned events
* View participant IDs
* View team IDs
* View relevant participant information

#### Attendance

* View attendance
* Mark attendance
* Scan QR codes
* Correct attendance where authorized
* Export attendance records

#### Event Operations

* Manage event rounds
* Enter event results where permitted
* Submit winners
* View event leaderboard

#### Communication

* Send announcements to participants registered for their assigned event

### Restrictions

An Event Coordinator cannot:

* Access unrelated events
* Manage other events
* Manage colleges
* Manage system users
* Change global settings
* Modify payment records outside their permitted scope
* Modify certificates unless explicitly granted certificate permissions

### Scope

Only assigned event IDs.

---

# 4.6 Judge

The Judge manages scoring for assigned competitions.

### Permissions

* Login
* View assigned event
* View participating teams
* View relevant participant information
* View judging criteria
* Enter scores
* Edit scores before submission
* Submit scores
* View submitted scores where permitted
* View relevant results

### Restrictions

Cannot:

* Modify registrations
* Modify payments
* Manage users
* Modify attendance
* Change event configuration

### Scope

Assigned event/competition.

---

# 4.7 Attendance Staff

Attendance Staff are responsible for event check-in.

### Permissions

* Login
* Scan QR codes
* Search participant IDs
* Search team IDs
* Verify registration
* Verify participant eligibility
* Mark attendance
* View check-in status
* Handle invalid/duplicate check-ins
* View event attendance
* Export attendance

### Restrictions

Cannot modify:

* Event configuration
* Payments
* Team membership
* Judging
* Certificates
* System users

### Scope

Assigned event or venue.

---

# 4.8 Finance Admin

The Finance Admin manages registration payments.

### Permissions

* View payment records
* View payment status
* Verify payments
* View transactions
* Handle payment issues
* Generate payment reports
* Export payment data
* View payment-related registration information

### Restrictions

Cannot modify:

* Team membership
* Attendance
* Event results
* Certificates
* System settings

---

# 4.9 Certificate Admin

The Certificate Admin manages certificates.

### Permissions

* View eligible participants
* View winners
* Generate certificates
* Generate certificates in bulk
* Regenerate certificates
* Publish certificates
* Download certificates
* Verify certificates
* Manage certificate templates
* Export certificate records

---

# 5. Core User Journey

## 5.1 College Registration

```text
College Admin
      ↓
Create/Login to College Account
      ↓
College Profile
      ↓
Add Participants
      ↓
Create Teams
```

---

# 6. Team Management

## 6.1 Team Creation

A Team Leader or authorized College Admin can create a team.

A team contains:

* Team ID
* Team name
* College
* Team leader
* Team members
* Registered events
* Registration status

## 6.2 Team Invitation

The Team Leader can invite participants.

Flow:

```text
Team Leader
     ↓
Enter participant information
     ↓
Send invitation
     ↓
Participant receives invitation
     ↓
Participant logs in
     ↓
Accept / Reject invitation
     ↓
Team membership updated
```

The system must prevent:

* Duplicate membership
* Invalid invitations
* Expired invitations
* Unauthorized team modification

---

# 7. Registration System

The platform must support configurable registration forms.

## Registration Form Features

* Text fields
* Number fields
* Email
* Phone
* Dropdown
* Radio buttons
* Checkboxes
* File uploads where required
* Required/optional fields
* Validation rules
* Event-specific fields

## Registration Levels

The system should support:

* Individual registration
* Team registration
* College registration

Each registration must have a unique identifier.

---

# 8. Payment System

The platform must support registration payments.

## Payment Requirements

* Payment initiation
* Payment status
* Transaction ID
* Registration ID
* Payment confirmation
* Failed payment handling
* Pending payment handling
* Payment verification
* Payment receipt
* Payment history

Possible statuses:

```text
PENDING
PROCESSING
SUCCESS
FAILED
REFUNDED
CANCELLED
```

Payment records must never be deleted in a way that destroys financial history.

---

# 9. Participant Identity

Every participant must have a unique identifier.

Example:

```text
Participant ID:
VTU26-000123

Team ID:
TEAM-00241

Registration ID:
REG-009842
```

IDs must be unique and immutable.

The participant dashboard should display:

* Participant ID
* Name
* College
* Team
* Registered events
* Registration status
* Payment status
* Attendance
* Certificates

---

# 10. Digital Pass / QR

Each eligible participant should receive a QR/digital pass.

The QR should identify the participant/registration securely without exposing unnecessary personal information.

The QR can be used for:

* Event entry
* Attendance
* Participant verification

The system must prevent unauthorized QR reuse where the event rules prohibit it.

---

# 11. Attendance Management

Attendance must be event-specific.

## Attendance Flow

```text
Participant arrives
       ↓
QR scanned
       ↓
Registration verified
       ↓
Participant eligibility checked
       ↓
Attendance recorded
       ↓
Timestamp stored
```

Attendance records should contain:

* Participant ID
* Team ID where applicable
* Event ID
* Registration ID
* Check-in timestamp
* Staff/coordinator who performed check-in
* Attendance status

Possible states:

```text
NOT_CHECKED_IN
CHECKED_IN
ABSENT
```

Attendance corrections must be audited.

---

# 12. Event Management

Super Admins can create and configure events.

Each event may contain:

* Event ID
* Event name
* Description
* Category
* Rules
* Registration type
* Maximum participants/teams
* Registration start
* Registration end
* Event date
* Event time
* Venue
* Assigned coordinators
* Assigned judges
* Status

Possible event statuses:

```text
DRAFT
OPEN
REGISTRATION_CLOSED
ONGOING
COMPLETED
CANCELLED
```

---

# 13. Coordinator Event Dashboard

This is a critical requirement.

When a coordinator logs in, they should **not see the entire platform**.

They should see:

```text
MY EVENTS

Event A
├── Registrations: 60
├── Participants: 180
├── Checked In: 142
├── Pending: 18
└── View Event

Event B
├── Registrations: 35
├── Participants: 91
├── Checked In: 70
├── Pending: 21
└── View Event
```

Inside an event:

```text
Overview
Registrations
Participants
Attendance
Rounds
Results
Announcements
Reports
```

The coordinator can view registrations and registration form responses for **their assigned events only**.

---

# 14. Results & Judging

The system must support event-specific results.

For judged events:

```text
Event
   ↓
Participants/Teams
   ↓
Judge Scores
   ↓
Score Calculation
   ↓
Final Results
   ↓
Winner
```

Results should support:

* Participant/team
* Score
* Rank
* Winner status
* Judge
* Submission timestamp

Once results are finalized, unauthorized users must not be able to modify them.

---

# 15. Certificates

Certificates must be generated based on eligibility.

Certificate types may include:

* Participation certificate
* Winner certificate
* Runner-up certificate
* Special recognition certificate

Each certificate should have:

* Unique certificate ID
* Participant name
* College
* Event
* Certificate type
* Issue date
* Verification mechanism

Participants should be able to download their certificates.

The platform should provide a public certificate verification mechanism.

---

# 16. Announcements

Admins and authorized event coordinators can send announcements.

Announcements may target:

* All participants
* Specific colleges
* Specific teams
* Specific events
* Specific participant groups

Participants should be able to view relevant announcements from their dashboard.

---

# 17. Dashboards

## Super Admin Dashboard

Display:

* Total colleges
* Total participants
* Total teams
* Total registrations
* Total events
* Registration trends
* Payment statistics
* Attendance statistics
* Event status
* Pending actions

## College Dashboard

Display:

* Participants
* Teams
* Event registrations
* Payment status
* Attendance
* Certificates

## Coordinator Dashboard

Display:

* Assigned events
* Event registrations
* Participant count
* Team count
* Attendance
* Pending registrations
* Results
* Event announcements

---

# 18. Reports & Exports

Authorized users should be able to export relevant information.

Supported formats:

* CSV
* Excel
* PDF where applicable

Reports include:

* Participant list
* Team list
* Registration list
* Event registrations
* Payment report
* Attendance report
* Results
* Certificate records

Access to reports must follow the user's scope.

---

# 19. Role-Based Access Control

The platform must implement:

**Role + Permission + Scope**

rather than relying only on a basic role field.

Example:

```text
User:
    role = EVENT_COORDINATOR

Permissions:
    registrations.read
    participants.read
    attendance.read
    attendance.write
    results.write
    announcements.write

Scope:
    event_ids = [EVENT-001, EVENT-004]
```

This means the coordinator can perform those actions only against their assigned events.

---

# 20. Permission Examples

| Action             | Super Admin | College Admin | Team Leader |  Participant |         Coordinator |         Judge | Attendance |    Finance |  Certificate |
| ------------------ | ----------: | ------------: | ----------: | -----------: | ------------------: | ------------: | ---------: | ---------: | -----------: |
| Manage Users       |           ✅ |             ❌ |           ❌ |            ❌ |                   ❌ |             ❌ |          ❌ |          ❌ |            ❌ |
| Manage Colleges    |           ✅ |           Own |           ❌ |            ❌ |                   ❌ |             ❌ |          ❌ |          ❌ |            ❌ |
| Create Events      |           ✅ |             ❌ |           ❌ |            ❌ |                   ❌ |             ❌ |          ❌ |          ❌ |            ❌ |
| View Event         |           ✅ |      Relevant |  Registered |   Registered |            Assigned |      Assigned |   Assigned |   Relevant |     Relevant |
| Create Team        |           ✅ |             ✅ |           ✅ |            ❌ |                   ❌ |             ❌ |          ❌ |          ❌ |            ❌ |
| Invite Members     |           ✅ |             ✅ |           ✅ |            ❌ |                   ❌ |             ❌ |          ❌ |          ❌ |            ❌ |
| Register Team      |           ✅ |             ✅ |           ✅ |            ❌ |                   ❌ |             ❌ |          ❌ |          ❌ |            ❌ |
| Registration Forms |      Manage |      Complete |    Complete |     Complete |       View Assigned | View Relevant |          ❌ |   Relevant |            ❌ |
| View Registrations |         All |   Own College |    Own Team |          Own | **Assigned Events** |      Assigned |   Assigned |   Relevant |     Relevant |
| Payments           |         All |           Own |         Own |          Own |             Limited |             ❌ |          ❌ | **Manage** |            ❌ |
| Attendance         |         All |          View |        View |     View Own | **Manage Assigned** |          View | **Manage** |          ❌ |            ❌ |
| Results            |         All |          View |        View |         View |       Manage/Submit |     **Score** |          ❌ |          ❌ |         View |
| Certificates       |         All |          View |        View | Download Own |                View |          View |          ❌ |          ❌ |   **Manage** |
| Reports            |         All |   Own College |    Own Team |          Own |            Assigned |      Assigned | Attendance |   Payments | Certificates |

---

# 21. Security Requirements

The production system must include:

* Secure authentication
* Password hashing
* Session/token security
* Role-based authorization
* Scope-based authorization
* Input validation
* Server-side permission checks
* Rate limiting
* Secure file uploads
* CSRF protection where applicable
* XSS protection
* SQL/NoSQL injection protection
* Audit logging
* Secure payment handling
* HTTPS
* Secure password reset
* Account recovery
* Login attempt protection

Permissions must always be enforced server-side.

Frontend restrictions alone are not sufficient.

---

# 22. Audit Logging

Important actions must be recorded.

Examples:

* Login
* Logout
* Team creation
* Team invitation
* Registration
* Payment changes
* Attendance changes
* Result submission
* Result modification
* Certificate generation
* User/role changes
* Permission changes

Audit logs should contain:

* Actor
* Action
* Resource
* Timestamp
* Previous value where appropriate
* New value where appropriate
* IP/device information where legally appropriate

---

# 23. Data Integrity

The system must maintain consistent relationships between:

```text
College
   ↓
Participant
   ↓
Team
   ↓
Registration
   ↓
Payment
   ↓
Event
   ↓
Attendance
   ↓
Result
   ↓
Certificate
```

Critical records such as payments, attendance corrections, and finalized results must not be silently overwritten or deleted.

---

# 24. Notifications

The system should support:

* Account creation
* Team invitation
* Invitation acceptance
* Registration confirmation
* Payment confirmation
* Payment failure
* Event announcements
* Registration status updates
* Attendance confirmation where applicable
* Certificate availability

Channels can include:

* In-app notifications
* Email
* Optional SMS/WhatsApp integration in future

---

# 25. Production Requirements

The application should be designed for:

* Multiple colleges
* Hundreds/thousands of participants
* Multiple simultaneous events
* Concurrent registrations
* Concurrent QR check-ins
* High traffic during registration opening
* High traffic during event check-in
* Reliable payment processing
* Reliable certificate generation

The system should support horizontal scaling where required.

---

# 26. Core Database Entities

The initial data model should include at minimum:

```text
User
Role
Permission
College
Participant
Team
TeamMember
TeamInvitation
Event
EventCoordinator
Judge
RegistrationForm
RegistrationField
Registration
Payment
Attendee
QRPass
Attendance
JudgeScore
Result
Certificate
Announcement
Notification
AuditLog
```

---

# 27. MVP Scope

The first production release should prioritize:

### Authentication

* Login
* Registration
* Password reset
* Role-based access

### College/Participant

* College accounts
* Participant accounts
* Participant IDs

### Teams

* Team creation
* Team invitations
* Team membership

### Events

* Event creation
* Event assignment
* Event registration
* Custom registration forms

### Payments

* Registration payment
* Payment status
* Transaction tracking

### Attendance

* QR generation
* QR scanning
* Attendance tracking

### Results

* Event results
* Winner management

### Certificates

* Certificate generation
* Certificate download
* Certificate verification

### Administration

* Admin dashboard
* Coordinator dashboard
* Reports
* Audit logs

---

# 28. Future Enhancements

Potential future versions may include:

* Food/menu management
* Accommodation
* Transportation
* Live leaderboards
* Advanced analytics
* WhatsApp notifications
* Mobile applications
* Offline QR attendance
* Advanced judging systems
* Automated scheduling
* Volunteer management
* Sponsor management
* Digital badges
* Advanced fraud detection

---

# 29. Success Criteria

The platform will be considered successful when:

1. A college can create/manage its participants.
2. A participant can create or join a team.
3. Team leaders can invite members.
4. Teams can register for events.
5. Registration forms can be customized per event.
6. Payments can be completed and tracked.
7. Every participant receives a unique ID.
8. Participants receive QR/digital passes.
9. Coordinators can see registrations for their assigned events.
10. Coordinators cannot access unrelated events.
11. Attendance can be recorded reliably.
12. Judges can submit event scores.
13. Winners can be finalized.
14. Certificates can be generated and verified.
15. Administrators can generate required reports.
16. All sensitive actions are protected by role and scope-based permissions.
17. Important changes are auditable.
18. The system remains usable under high event-day traffic.

---

# 30. Primary End-to-End Workflow

```text
COLLEGE
   ↓
College Admin Login
   ↓
Add Participants
   ↓
Create Team
   ↓
Invite Members
   ↓
Members Accept Invitation
   ↓
Select Event
   ↓
Complete Registration Form
   ↓
Payment
   ↓
Registration Confirmed
   ↓
Participant ID + Team ID
   ↓
QR / Digital Pass
   ↓
Event Day
   ↓
QR Verification
   ↓
Attendance
   ↓
Competition / Event
   ↓
Judging / Results
   ↓
Winner Finalization
   ↓
Certificate Generation
   ↓
Participant Downloads Certificate
   ↓
Public Certificate Verification
```

---

# 31. Product Principle

The platform should follow one central principle:

> **Every user should see and control only the information and actions necessary for their role and scope.**

A coordinator assigned to Event A should see Event A's registrations—not every registration in the system.

A College Admin should see their college—not other colleges.

A Team Leader should see their team—not other teams.

A Participant should see their own participation—not other participants.

The Super Admin retains system-wide control.

This role + permission + scope architecture is the foundation of the production system.