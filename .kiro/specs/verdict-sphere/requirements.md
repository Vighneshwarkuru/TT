# Requirements Document

## Introduction

VerdictSphere is a full-stack hackathon evaluation platform that enables objective, criteria-based judging across three user roles: Administrators, Judges, and Participants. The system provides role-specific dashboards, weighted scoring, real-time leaderboards, and audit logging. The backend is built with Spring Boot (Java 17+) and the frontend with React 18+, backed by a MySQL 8+ database.

## Glossary

- **System**: The VerdictSphere application as a whole
- **Admin**: A user with the ADMIN role who manages the platform
- **Judge**: A user with the JUDGE role who evaluates teams; accounts are created by an Admin, not self-registered
- **Participant**: A user with the PARTICIPANT role who creates and manages a team
- **Hackathon**: A timed competition event managed by an Admin
- **Team**: A group of Participants competing in a Hackathon
- **Criteria**: A scoring dimension with a defined weight and maximum score used to evaluate Teams
- **Evaluation**: A Judge's scored assessment of a Team against one or more Criteria
- **Weighted_Score**: The computed score for a Team: Σ(score × weight) / Σ(max_score × weight) × 100
- **Leaderboard**: A ranked list of Teams sorted by average Weighted_Score descending, with tie-breaking by innovation score
- **JWT**: JSON Web Token used for stateless authentication
- **Refresh_Token**: A long-lived token used to obtain a new JWT without re-authentication
- **Audit_Log**: An immutable record of significant system actions for accountability
- **Judge_Assignment**: A mapping between a Judge and the Teams they are responsible for evaluating
- **Team_Acceptance**: The approval status of a Team, set by an Admin or Judge, that determines eligibility for evaluation
- **Auth_Service**: The component responsible for authentication and token management
- **User_Manager**: The Admin component responsible for user lifecycle management, including Judge account creation
- **Hackathon_Manager**: The Admin component responsible for Hackathon CRUD operations
- **Criteria_Manager**: The Admin component responsible for defining and weighting Criteria
- **Evaluation_Engine**: The component that computes Weighted_Scores and rankings
- **Leaderboard_Service**: The component that serves ranked Team results
- **Audit_Service**: The component that records and retrieves Audit_Log entries

---

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a visitor, I want to register and log in, so that I can access the platform as a Participant.

#### Acceptance Criteria

1. WHEN a visitor submits a registration form with a unique email and valid password via POST /api/auth/register, THE Auth_Service SHALL create a new user account with the PARTICIPANT role and a BCrypt-hashed password.
2. THE System SHALL seed exactly 3 Admin accounts at application startup with hardcoded credentials; Admin accounts SHALL NOT be creatable via the registration endpoint.
3. IF a visitor submits a registration form with an email that already exists, THEN THE Auth_Service SHALL return a 409 Conflict error with a descriptive message.
4. WHEN a user submits valid credentials via POST /api/auth/login, THE Auth_Service SHALL return a JWT with a 15-minute expiry and a Refresh_Token.
5. WHEN a user submits a valid Refresh_Token via POST /api/auth/refresh-token, THE Auth_Service SHALL return a new JWT with a 15-minute expiry.
6. IF a user submits an expired or invalid Refresh_Token, THEN THE Auth_Service SHALL return a 401 Unauthorized error.
7. IF a user submits invalid credentials via POST /api/auth/login, THEN THE Auth_Service SHALL return a 401 Unauthorized error without revealing which field is incorrect.
8. THE Auth_Service SHALL hash all passwords using BCrypt before persisting them to the database.

---

### Requirement 2: Judge Account Management by Admin

**User Story:** As an Admin, I want to create Judge accounts directly, so that only vetted evaluators can access the platform.

#### Acceptance Criteria

1. WHEN an Admin submits a judge creation request via POST /api/admin/judges with an email and password, THE User_Manager SHALL create a new user account with the JUDGE role and a BCrypt-hashed password and record an Audit_Log entry.
2. IF an Admin submits a judge creation request with an email that already exists, THEN THE User_Manager SHALL return a 409 Conflict error with a descriptive message.
3. THE User_Manager SHALL return all Judge accounts via GET /api/admin/judges.
4. WHEN an Admin submits a delete request for a Judge via DELETE /api/admin/judges/{id}, THE User_Manager SHALL remove the Judge account and record an Audit_Log entry.
5. THE User_Manager SHALL allow an Admin to list all users with their roles and statuses via GET /api/admin/users.

---

### Requirement 3: Hackathon Management

**User Story:** As an Admin, I want to create and manage hackathons, so that I can organize competitions with defined timelines.

#### Acceptance Criteria

1. WHEN an Admin submits a valid hackathon creation request via POST /api/admin/hackathons, THE Hackathon_Manager SHALL persist the Hackathon with a name, description, start date, end date, and status.
2. WHEN an Admin submits an update request via PUT /api/admin/hackathons/{id}, THE Hackathon_Manager SHALL update the specified Hackathon's fields and record an Audit_Log entry.
3. WHEN an Admin submits a delete request via DELETE /api/admin/hackathons/{id}, THE Hackathon_Manager SHALL remove the Hackathon and record an Audit_Log entry.
4. THE Hackathon_Manager SHALL return all Hackathons via GET /api/admin/hackathons.
5. THE System SHALL expose active Hackathons to unauthenticated users via GET /api/public/active-hackathons.
6. IF an Admin submits a hackathon with an end date earlier than the start date, THEN THE Hackathon_Manager SHALL return a 400 Bad Request error with a descriptive validation message.

---

### Requirement 4: Criteria and Weight Management

**User Story:** As an Admin, I want to define scoring criteria with weights, so that evaluations reflect the competition's priorities.

#### Acceptance Criteria

1. WHEN an Admin submits a criteria creation request via POST /api/admin/criteria, THE Criteria_Manager SHALL persist the Criteria with a name, description, weight, and max_score associated with a specific Hackathon.
2. WHEN an Admin submits an update request via PUT /api/admin/criteria/{id}, THE Criteria_Manager SHALL update the specified Criteria and record an Audit_Log entry.
3. WHEN an Admin submits a delete request via DELETE /api/admin/criteria/{id}, THE Criteria_Manager SHALL remove the Criteria and record an Audit_Log entry.
4. IF the sum of weights for all Criteria in a Hackathon does not equal 100, THEN THE Criteria_Manager SHALL return a 400 Bad Request error when the Admin attempts to activate the Hackathon.
5. IF an Admin submits a Criteria with a weight less than or equal to 0 or greater than 100, THEN THE Criteria_Manager SHALL return a 400 Bad Request error.

---

### Requirement 5: Team Management by Participants

**User Story:** As a Participant, I want to create a team or join an existing one, so that I can compete in a hackathon with others.

#### Acceptance Criteria

1. WHEN a Participant submits a team creation request via POST /api/participant/team with a unique team name, THE System SHALL create a Team associated with the Participant and a specified Hackathon, with the creator as the first member and member count set to 1.
2. THE System SHALL expose a public team listing via GET /api/public/teams/{hackathonId} returning each team's id, team_name, member_count, and max capacity (4), so Participants can browse available teams.
3. WHEN a Participant submits a join request via POST /api/participant/team/join with a team_id or team_name, THE System SHALL create a join request with status PENDING and notify the Team Lead, without adding the Participant to the team yet.
4. WHEN a Team Lead accepts a join request via PUT /api/participant/team/join-requests/{requestId}/accept, THE System SHALL add the requesting Participant to the Team's member list and set the join request status to ACCEPTED.
5. WHEN a Team Lead rejects a join request via PUT /api/participant/team/join-requests/{requestId}/reject, THE System SHALL set the join request status to REJECTED and not add the Participant to the team.
6. THE System SHALL return all pending join requests for the authenticated Team Lead's team via GET /api/participant/team/join-requests.
7. IF a Team already has 4 members, THEN THE System SHALL return a 409 Conflict error with the message "Team is full" when a join request is submitted.
8. IF a Participant is already a member of a Team in the same Hackathon, THEN THE System SHALL return a 409 Conflict error when they attempt to create or join another Team.
9. IF a Participant already has a PENDING join request for a Team, THEN THE System SHALL return a 409 Conflict error when they attempt to submit another join request for the same Team.
10. WHEN a Participant submits a request to remove a member via DELETE /api/participant/team/members/{userId}, THE System SHALL remove the specified user from the Team's member list; only the Team Lead SHALL be permitted to remove members.
7. WHEN a Participant submits a project submission via PUT /api/participant/team/submission, THE System SHALL persist the GitHub URL, demo URL, and presentation URL associated with the Team.
8. IF a submitted GitHub URL or demo URL does not match a valid URL format, THEN THE System SHALL return a 400 Bad Request error.
9. THE System SHALL return each Team's current member_count alongside team details in all team listing responses.

---

### Requirement 5a: Team Acceptance Workflow

**User Story:** As an Admin or Judge, I want to accept or reject registered teams, so that only vetted teams are eligible for evaluation.

#### Acceptance Criteria

1. WHEN a Participant registers a Team, THE System SHALL set the Team's `acceptance_status` to PENDING.
2. WHILE a Team's `acceptance_status` is PENDING, THE System SHALL prevent any Judge from submitting an Evaluation for that Team and return a 403 Forbidden error.
3. WHEN an Admin submits an acceptance request via PUT /api/admin/teams/{id}/accept, THE System SHALL set the Team's `acceptance_status` to ACCEPTED and record an Audit_Log entry.
4. WHEN a Judge submits an acceptance request via PUT /api/judge/teams/{id}/accept, THE System SHALL set the Team's `acceptance_status` to ACCEPTED and record an Audit_Log entry.
5. WHEN an Admin submits a rejection request via PUT /api/admin/teams/{id}/reject, THE System SHALL set the Team's `acceptance_status` to REJECTED and record an Audit_Log entry.
6. WHEN a Judge submits a rejection request via PUT /api/judge/teams/{id}/reject, THE System SHALL set the Team's `acceptance_status` to REJECTED and record an Audit_Log entry.
7. THE System SHALL return all Teams with their `acceptance_status` to Admins via GET /api/admin/teams.
8. THE System SHALL return all Teams with their `acceptance_status` to Judges via GET /api/judge/teams.

---

### Requirement 6: Judge Assignment

**User Story:** As an Admin, I want to assign judges to teams in a balanced way, so that each team receives fair evaluation coverage.

#### Acceptance Criteria

1. WHEN an Admin triggers judge assignment for a Hackathon, THE System SHALL create Judge_Assignments distributing Teams evenly across all Judges, with each Judge assigned between 5 and 10 Teams.
2. WHEN an Admin submits a manual assignment via POST /api/admin/judge-assignments, THE System SHALL create a Judge_Assignment linking the specified Judge to the specified Team.
3. THE System SHALL return all Judge_Assignments for a Hackathon via GET /api/admin/judge-assignments/{hackathonId}.
4. IF a Judge is already assigned to a Team, THEN THE System SHALL return a 409 Conflict error when a duplicate assignment is attempted.

---

### Requirement 7: Evaluation Submission by Judges

**User Story:** As a Judge, I want to score assigned teams against each criterion and leave remarks, so that I can provide structured evaluations.

#### Acceptance Criteria

1. THE System SHALL return all Teams assigned to the authenticated Judge via GET /api/judge/assignments.
2. WHEN a Judge submits an evaluation via POST /api/judge/evaluations, THE System SHALL persist a score and remarks for each Criteria for the specified Team, associated with the authenticated Judge.
3. WHEN a Judge submits an update to an existing evaluation via PUT /api/judge/evaluations/{id}, THE System SHALL update the score and remarks and record an Audit_Log entry.
4. IF a Judge submits a score that exceeds the Criteria's max_score, THEN THE System SHALL return a 400 Bad Request error.
5. IF a Judge submits a score less than 0, THEN THE System SHALL return a 400 Bad Request error.
6. IF a Judge attempts to submit an evaluation for a Team not in their Judge_Assignment list, THEN THE System SHALL return a 403 Forbidden error.
7. IF a Judge attempts to submit an evaluation for a Team whose `acceptance_status` is not ACCEPTED, THEN THE System SHALL return a 403 Forbidden error with the message "Team has not been accepted for evaluation."
8. THE System SHALL return all Evaluations submitted by the authenticated Judge via GET /api/judge/evaluations.

---

### Requirement 8: Weighted Score Computation and Ranking

**User Story:** As an Admin or Judge, I want to see computed rankings, so that I can understand which teams are leading.

#### Acceptance Criteria

1. THE Evaluation_Engine SHALL compute a Team's Weighted_Score as: Σ(score × weight) / Σ(max_score × weight) × 100, aggregated across all Criteria and averaged across all assigned Judges.
2. THE Leaderboard_Service SHALL rank Teams in descending order of Weighted_Score.
3. WHEN two Teams have equal Weighted_Scores, THE Leaderboard_Service SHALL rank the Team with the higher innovation criterion score first.
4. THE Leaderboard_Service SHALL return the ranked leaderboard for a Hackathon via GET /api/public/leaderboard/{hackathonId}.
5. THE System SHALL return the leaderboard to authenticated Judges via GET /api/judge/leaderboard.
6. THE System SHALL return the leaderboard to authenticated Participants via GET /api/participant/leaderboard.

---

### Requirement 9: Participant Score Visibility

**User Story:** As a Participant, I want to view my team's scores and judge feedback, so that I can understand how we performed.

#### Acceptance Criteria

1. THE System SHALL return the authenticated Participant's Team scores and per-criteria feedback via GET /api/participant/scores.
2. WHILE a Hackathon is in progress, THE System SHALL return only the Participant's own Team scores and SHALL NOT expose other Teams' scores via the participant scores endpoint.
3. WHEN a Hackathon's status is set to COMPLETED, THE System SHALL make the full leaderboard available to all authenticated users.

---

### Requirement 10: Admin Analytics and Results Export

**User Story:** As an Admin, I want to view evaluation analytics and export results, so that I can report outcomes and identify issues.

#### Acceptance Criteria

1. THE System SHALL return an evaluation completion summary per Judge and per Team for a Hackathon via GET /api/admin/analytics/{hackathonId}.
2. WHEN an Admin requests a results export via GET /api/admin/export/{hackathonId}, THE System SHALL return a CSV file containing Team names, Weighted_Scores, per-criteria scores, and final rankings.
3. THE System SHALL return paginated Audit_Log entries via GET /api/admin/audit-logs with filtering by user, action type, and date range.

---

### Requirement 11: Audit Logging

**User Story:** As an Admin, I want all significant actions to be logged, so that I can maintain accountability and trace issues.

#### Acceptance Criteria

1. WHEN any user performs a create, update, or delete operation on a Hackathon, Criteria, Team, Evaluation, or User, THE Audit_Service SHALL record an Audit_Log entry containing the actor's user ID, action type, affected entity type, affected entity ID, and a UTC timestamp.
2. THE Audit_Service SHALL record an Audit_Log entry whenever a Judge account is created or deleted, or a Team's `acceptance_status` changes.
3. THE Audit_Log entries SHALL be immutable; THE System SHALL not expose any endpoint that allows modification or deletion of Audit_Log entries.

---

### Requirement 12: Role-Based Access Control

**User Story:** As a system operator, I want all endpoints protected by role, so that users can only access data and actions appropriate to their role.

#### Acceptance Criteria

1. THE System SHALL protect all /api/admin/** endpoints so that only users with the ADMIN role can access them, returning 403 Forbidden for all other roles.
2. THE System SHALL protect all /api/judge/** endpoints so that only users with the JUDGE role can access them, returning 403 Forbidden for all other roles.
3. THE System SHALL protect all /api/participant/** endpoints so that only users with the PARTICIPANT role can access them, returning 403 Forbidden for all other roles.
4. THE System SHALL allow unauthenticated access to /api/public/**, /api/auth/register, and /api/auth/login.
5. IF a request to a protected endpoint is made without a valid JWT, THEN THE System SHALL return a 401 Unauthorized error.

---

### Requirement 13: Frontend – Public Pages

**User Story:** As a visitor, I want a landing page, login, and registration UI, so that I can discover and join the platform.

#### Acceptance Criteria

1. THE System SHALL render a public landing page at / displaying active Hackathons fetched from GET /api/public/active-hackathons.
2. THE System SHALL render a login form at /login that submits credentials to POST /api/auth/login and stores the returned JWT and Refresh_Token in the browser.
3. THE System SHALL render a registration form at /register with fields for name, email, and password only; THE System SHALL NOT include a role selection field, and all registrants SHALL be assigned the PARTICIPANT role automatically, submitting to POST /api/auth/register.
4. WHEN a login or registration request fails, THE System SHALL display the error message returned by the API to the user.
5. WHEN a JWT expires, THE System SHALL automatically attempt to obtain a new JWT using the stored Refresh_Token before retrying the original request.

---

### Requirement 14: Frontend – Admin Dashboard

**User Story:** As an Admin, I want a comprehensive dashboard, so that I can manage all aspects of the platform from one place.

#### Acceptance Criteria

1. THE System SHALL render the Admin Dashboard at /admin, accessible only to authenticated users with the ADMIN role.
2. THE System SHALL provide an Overview panel showing total hackathons, total judges, total teams, and pending team acceptances.
3. THE System SHALL provide a Hackathon Manager panel supporting create, read, update, and delete operations for Hackathons.
4. THE System SHALL provide a Judge Management panel that allows an Admin to create Judge accounts by submitting an email and password, list all existing Judges, and delete Judge accounts.
5. THE System SHALL provide a User Manager panel listing all users with their roles and statuses.
6. THE System SHALL provide a Criteria Manager panel supporting create, read, update, and delete operations for Criteria per Hackathon.
7. THE System SHALL provide a Team Manager panel listing all Teams with their members, submission links, and `acceptance_status`, with options to accept or reject each Team.
8. THE System SHALL provide an Evaluation Monitor panel showing evaluation completion status per Judge and per Team.
9. THE System SHALL provide a Results Generator panel that triggers CSV export and displays the ranked leaderboard.
10. THE System SHALL provide an Audit Viewer panel displaying paginated Audit_Log entries with filters for user, action type, and date range.

---

### Requirement 15: Frontend – Judge Dashboard

**User Story:** As a Judge, I want a focused dashboard, so that I can efficiently evaluate my assigned teams.

#### Acceptance Criteria

1. THE System SHALL render the Judge Dashboard at /judge, accessible only to authenticated Judges.
2. THE System SHALL provide a Team Acceptance panel listing all Teams with their `acceptance_status`, with options to accept or reject each Team.
3. THE System SHALL provide an Assigned Teams panel listing all Teams in the Judge's Judge_Assignment list that have been ACCEPTED.
4. THE System SHALL provide an Evaluation Form panel that renders input fields for each Criterion and a remarks field, submitting to POST /api/judge/evaluations or PUT /api/judge/evaluations/{id}.
5. THE System SHALL provide a My Evaluations panel listing all Evaluations submitted by the authenticated Judge.
6. THE System SHALL provide a read-only Leaderboard panel fetching data from GET /api/judge/leaderboard.

---

### Requirement 16: Frontend – Participant Dashboard

**User Story:** As a Participant, I want a dashboard to manage my team and track my progress, so that I can stay informed throughout the competition.

#### Acceptance Criteria

1. THE System SHALL render the Participant Dashboard at /participant, accessible only to authenticated Participants.
2. THE System SHALL provide a Team Browser panel listing all teams for the active Hackathon, showing team name, team ID, and current member count out of 4 (e.g. "2/4"), so Participants can find teams to join.
3. THE System SHALL allow a Participant to send a join request to a team from the Team Browser by team name or team ID via a "Request to Join" button, calling POST /api/participant/team/join; the Participant SHALL NOT be added to the team until the Team Lead accepts.
4. THE System SHALL provide a Join Requests panel visible only to the Team Lead, listing all pending join requests with the requester's name and a button to accept or reject each request.
5. THE System SHALL provide a Team Profile panel for creating a new team or editing the existing Team's name and description (Team Lead only).
5. THE System SHALL provide a Team Members panel showing current members and allowing removal of members.
6. THE System SHALL provide a Project Submission panel with fields for GitHub URL, demo URL, and presentation URL.
7. THE System SHALL provide a My Scores panel displaying the Team's per-criteria scores and Judge remarks fetched from GET /api/participant/scores.
8. THE System SHALL provide a Leaderboard panel fetching data from GET /api/participant/leaderboard.
