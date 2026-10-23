# Dotbugi Privacy Policy

::: info
[**Dotbugi**](https://github.com/hs-shell/dotbugi) Privacy Policy
:::

**Effective Date:** 2025/03/08

## 1. Introduction

The Hansung University LMS Consolidation Extension is designed to aggregate lectures, assignments, and quizzes from the Hansung University LMS into a single view, enabling users to easily check their attendance and submission statuses. This Privacy Policy explains what information is collected, how it is used, and how it is stored.

## 2. Information Collection

### Website Content

This extension collects web content from the Hansung University LMS, including information about lectures, assignments, quizzes, as well as attendance and submission statuses.

### Specific Data

In particular, the extension gathers:

- **Lecture Information:** Course names, schedules, instructor details, etc.
- **Assignment Information:** Assignment titles, due dates, detailed descriptions, etc.
- **Quiz Information:** Quiz titles, schedules, questions, and answer details.
- **Attendance and Submission Status:** Information on user attendance for lectures and submission statuses for assignments/quizzes.
- **Google Calendar Integration Credentials:** Authentication tokens and credentials required to synchronize with Google Calendar.
- **LMS Login Session (Authentication Information):** The Hansung University LMS session cookie (`MoodleSession`), read only when the user explicitly approves a dotbugi-mcp connection.

## 3. Data Storage and Security

### Local Storage

All collected data—including Google Calendar integration credentials—is stored solely on your browser or local storage. No data is transmitted to external servers or third parties.

### No Personal/Sensitive Data

Beyond the necessary LMS web content and the credentials needed for Google Calendar integration, no additional personal or sensitive data is collected.

### Regarding Storage/Deletion of Google User Data

When you choose to enable calendar synchronization, this extension accesses your Google Calendar via Google OAuth2 only to retrieve events in order to check for duplicates and add new events if no duplicates are found. **No Google Calendar event information is stored or shared**; data is loaded temporarily to perform duplication checks and then discarded immediately.

### dotbugi-mcp Connection (Local Hand-off Only)

Only when the user runs `dotbugi-mcp login` on their own PC and clicks **Connect** in the confirmation window opened by the extension, the LMS login session is sent once to **dotbugi-mcp waiting on `127.0.0.1` (localhost) on the same PC**.

- The session is never sent to external servers or third parties, and is not sent anywhere other than the local address (`127.0.0.1`).
- A pending request is kept briefly in the browser's session storage and is deleted as soon as the confirmation window opens.
- Chrome may ask for an optional permission for `127.0.0.1` for this purpose. `127.0.0.1` refers to the user's own PC.

## 4. Use of Collected Data

The collected data is used exclusively to:

- Aggregate and display lecture, assignment, and quiz information from the Hansung University LMS in a unified interface
- Provide convenient access to attendance and submission statuses for the user
- (If desired by the user) Synchronize assignment and quiz schedules with Google Calendar

The data is not used for tracking, analytics, or any other external purposes. Google Calendar integration credentials are used only within your local environment for synchronization purposes.

## 5. User Consent

By installing and using the Hansung University LMS Consolidation Extension, you consent to the collection and local storage of the LMS web content and Google Calendar integration credentials as described in this Privacy Policy. No data will be shared without your explicit consent.

## 6. Changes to This Policy

This Privacy Policy may be updated from time to time. Any significant changes will be communicated through appropriate channels. We encourage you to review this policy periodically for any modifications.

## 7. Contact Information

For questions or concerns regarding this Privacy Policy, please contact us at:
**Email:** 6ukeem@gmail.com
