# Update Log

## v5.3.1

- Fixed watch badges and download buttons appearing on video lectures that are not yet published
- Improved security by restricting the player to LMS addresses only

## v5.3.0

- Show the download button on video lectures whose viewing period has ended
- Fixed Google Calendar sign-in failing in browsers other than Chrome

## v5.2.1

- Fixed the closed player window blocking clicks on the main page

## v5.2.0

- Added a download button for video lectures (saved as MP4; unencrypted videos only)
- Dashboard and player windows now open and close with a smooth fade, and no longer jump when opening
- Fixed the dashboard appearing empty after the first refresh
- Fixed some course toggles not showing and the player not opening the first time
- Due dates are now calculated in Korea time, and quiz loading failures are handled better
- The dotbugi-mcp connection success window now closes automatically after 5 seconds

## v5.1.0

- Added dotbugi-mcp connection (view your LMS to-dos from AI tools such as Claude)
- Improved security by checking where LMS links point before opening them

## v5.0.5

- Fixed autoplay end time shifting forward when advancing to the next video

## v5.0.4

- Split logs into categories (player/course/calendar/storage/general) with ZIP download support
- Added player autoplay debug logging to trace video skip/end/resume causes
- Prevent unnecessary OAuth token requests for users not signed in to Google Calendar
- Fixed last video attendance not being recorded by waiting 60 seconds for LMS progress submission

## v5.0.3

- Fixed bug where attended lectures were shown as absent on courses without the "Required time" column
- Dynamically detect attendance table columns to support both 5-column and 6-column layouts
- Fixed non-tracked course data accumulating in local storage indefinitely
- Removed unnecessary OAuth error logs for users not signed in to Google
- Include tracked course data snapshot in log downloads
- Removed unused dependencies and improved bundle splitting
- Removed auto-opening dotbugi page on extension update

## v5.0.2

- Fixed bug where courses were not auto-tracked on first install/update
- Auto-track newly added courses, auto-remove courses no longer in the list
- Fixed incorrect current week highlight on past semester courses
- Extension icon click now opens docs page based on user language setting

## v5.0.0

- Multi-language support (Korean/English/Japanese/Chinese)
- Per-course tracking selection
- Quiz submission tracking and task hiding
- Course page status badges and current week highlight
- Popover settings tab and calendar integration improvements
- VOD watch progress tracking improvements
- Auto-retry on network errors with partial failure tolerance
- Log download feature
- Automatic filtering of past semester courses

## v4.0.5

- Course page status badges and current week highlight feature
- Quiz submission tracking and task hiding feature
- Per-course tracking selection and UX improvements
- Popover settings tab and calendar integration improvements
- Multi-language (i18n) support and LMS parsing localization
