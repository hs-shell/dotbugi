# Update Log

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
