# Implementation Plan - Phase 7: Email & Settings

- [x] 1. Update Admin Sidebar Navigation





  - [x] 1.1 Add "Học kỳ" menu item to AdminSidebar


    - Add menu item between "Khóa học" and "Chuyên ngành"
    - Use calendar icon for the menu
    - Link to `/semesters`
    - _Requirements: 9.1, 9.4_

  - [x] 1.2 Add "Cài đặt" and "Hướng dẫn" menu items

    - Add "Cài đặt" with settings icon, link to `/settings`
    - Add "Hướng dẫn" with help icon, link to `/help`
    - Place at bottom of navigation
    - _Requirements: 9.2, 9.3, 9.5, 9.6_

- [x] 2. Create Password Change Schemas and Service





  - [x] 2.1 Create password validation schema


    - Create `packages/schemas/src/settings.schema.ts`
    - Define PasswordChangeInputSchema with Zod
    - Validate: min 8 chars, uppercase, lowercase, number
    - _Requirements: 1.4, 10.5_
  - [ ]* 2.2 Write property test for password validation
    - **Property 1: Password validation enforces complexity requirements**
    - **Validates: Requirements 1.4, 10.5**
  - [ ]* 2.3 Write property test for password mismatch
    - **Property 2: Password mismatch detection**
    - **Validates: Requirements 1.5, 10.6**
  - [x] 2.4 Create password service


    - Create `packages/firebase/src/services/password.service.ts`
    - Implement changePassword function using Firebase Auth
    - Implement validatePasswordStrength function
    - _Requirements: 1.2, 10.3_

- [ ] 3. Create Admin Settings Page - Account Section
  - [ ] 3.1 Create PasswordChangeForm component
    - Create `apps/admin/src/components/features/settings/PasswordChangeForm.tsx`
    - Form with current password, new password, confirm password
    - Use react-hook-form with zodResolver
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [ ] 3.2 Create AccountSettings component
    - Create `apps/admin/src/components/features/settings/AccountSettings.tsx`
    - Collapsible card with password change form
    - Display success/error messages
    - _Requirements: 7.1, 7.4_

- [ ] 4. Checkpoint - Ensure password change works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Create Email Settings Schema and Service
  - [ ] 5.1 Create email settings schema
    - Add EmailSettingsSchema to `packages/schemas/src/settings.schema.ts`
    - Define gmailConnected, gmailEmail, connectedAt fields
    - _Requirements: 2.1_
  - [ ]* 5.2 Write property test for email settings state
    - **Property 3: Email settings state consistency**
    - **Validates: Requirements 2.1**
  - [ ] 5.3 Create settings service
    - Create `packages/firebase/src/services/settings.service.ts`
    - Implement getEmailSettings, disconnectGmail functions
    - Store settings in `/settings/email` document
    - _Requirements: 2.1, 2.4_
  - [ ]* 5.4 Write property test for disconnect
    - **Property 4: Disconnect clears credentials**
    - **Validates: Requirements 2.4**

- [ ] 6. Create Email Settings UI
  - [ ] 6.1 Create EmailSettings component
    - Create `apps/admin/src/components/features/settings/EmailSettings.tsx`
    - Display connection status (connected/disconnected)
    - Show connected email and timestamp if connected
    - Buttons: Connect/Disconnect, Test Email
    - _Requirements: 2.1, 2.3, 2.4, 2.5_
  - [ ] 6.2 Create useEmailSettings hook
    - Create `apps/admin/src/hooks/useEmailSettings.ts`
    - Fetch email settings from Firestore
    - Handle connect/disconnect mutations
    - _Requirements: 2.1, 2.4_

- [ ] 7. Create Email Template Schema and Service
  - [ ] 7.1 Create email template schema
    - Create `packages/schemas/src/email-template.schema.ts`
    - Define EmailTemplateSchema, PlaceholderSchema
    - _Requirements: 3.1, 4.1_
  - [ ] 7.2 Create email template service
    - Create `packages/firebase/src/services/email-template.service.ts`
    - Implement getTemplates, getTemplate, updateTemplate
    - Implement previewTemplate with placeholder replacement
    - _Requirements: 3.1, 3.5, 3.6_
  - [ ]* 7.3 Write property test for placeholder replacement
    - **Property 5: Placeholder replacement completeness**
    - **Validates: Requirements 3.5, 4.2, 8.2**
  - [ ]* 7.4 Write property test for template save round-trip
    - **Property 6: Template save round-trip**
    - **Validates: Requirements 3.6**
  - [ ]* 7.5 Write property test for invalid placeholder detection
    - **Property 7: Invalid placeholder detection**
    - **Validates: Requirements 3.7**

- [ ] 8. Create Email Template Editor UI
  - [ ] 8.1 Create EmailTemplateEditor component
    - Create `apps/admin/src/components/features/settings/EmailTemplateEditor.tsx`
    - Template selector dropdown
    - Subject input field
    - Rich text editor for body (use textarea for MVP)
    - Placeholder buttons to insert {name}, {email}, etc.
    - _Requirements: 3.2, 3.3, 3.4_
  - [ ] 8.2 Create EmailTemplatePreview component
    - Create `apps/admin/src/components/features/settings/EmailTemplatePreview.tsx`
    - Modal showing rendered email with sample data
    - _Requirements: 3.5_
  - [ ] 8.3 Create useEmailTemplates hook
    - Create `apps/admin/src/hooks/useEmailTemplates.ts`
    - Fetch templates, handle save mutation
    - _Requirements: 3.1, 3.6_

- [ ] 9. Create Admin Settings Page
  - [ ] 9.1 Create Settings page
    - Create `apps/admin/src/app/(dashboard)/settings/page.tsx`
    - Layout with 3 collapsible sections: Account, Email Config, Email Templates
    - _Requirements: 7.1, 7.2_
  - [ ]* 9.2 Write property test for form dirty state
    - **Property 9: Form dirty state tracking**
    - **Validates: Requirements 7.3**

- [ ] 10. Checkpoint - Ensure settings page works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Create Help Topic Schema and Service
  - [ ] 11.1 Create help topic schema
    - Create `packages/schemas/src/help-topic.schema.ts`
    - Define HelpCategorySchema, HelpTopicSchema
    - _Requirements: 5.1, 5.4_
  - [ ] 11.2 Create help content data
    - Create `apps/admin/src/data/helpTopics.ts`
    - Define static help content for all categories
    - Categories: getting-started, student-management, course-management, tracking, settings, faq
    - _Requirements: 5.4_

- [ ] 12. Create Admin Help Page
  - [ ] 12.1 Create HelpTopicList component
    - Create `apps/admin/src/components/features/help/HelpTopicList.tsx`
    - Sidebar with categorized topics
    - Highlight selected topic
    - _Requirements: 5.1, 5.2_
  - [ ] 12.2 Create HelpSearch component
    - Create `apps/admin/src/components/features/help/HelpSearch.tsx`
    - Search input to filter topics
    - _Requirements: 5.3_
  - [ ]* 12.3 Write property test for help search
    - **Property 8: Help search filtering**
    - **Validates: Requirements 5.3**
  - [ ] 12.4 Create HelpContent component
    - Create `apps/admin/src/components/features/help/HelpContent.tsx`
    - Display selected topic content
    - Render markdown content
    - _Requirements: 5.2, 5.5_
  - [ ] 12.5 Create Help page
    - Create `apps/admin/src/app/(dashboard)/help/page.tsx`
    - Two-column layout: topic list + content
    - Search bar at top
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 13. Checkpoint - Ensure help page works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Create Student Handbook Page
  - [ ] 14.1 Add Handbook menu to StudentSidebar
    - Add "Handbook" menu item to StudentSidebar
    - Use book icon
    - Link to `/handbook`
    - _Requirements: 6.5_
  - [ ] 14.2 Create StudentHandbook component
    - Create `apps/student/src/components/features/handbook/StudentHandbook.tsx`
    - Use existing Flipbook component from @tdc/ui
    - Display empty state if no handbook available
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ] 14.3 Create useStudentHandbook hook
    - Create `apps/student/src/hooks/useStudentHandbook.ts`
    - Fetch handbook URL from handbook service
    - _Requirements: 6.2_
  - [ ] 14.4 Create Handbook page
    - Create `apps/student/src/app/(portal)/handbook/page.tsx`
    - Display StudentHandbook component
    - _Requirements: 6.1_

- [ ] 15. Create Student Password Change
  - [ ] 15.1 Create PasswordChangeSection component
    - Create `apps/student/src/components/features/profile/PasswordChangeSection.tsx`
    - Collapsible section with password change form
    - Reuse validation logic from admin
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  - [ ] 15.2 Update Profile page
    - Add PasswordChangeSection to existing Profile page
    - _Requirements: 10.1_

- [ ] 16. Create Email Sending Service
  - [ ] 16.1 Create email service
    - Create `packages/firebase/src/services/email.service.ts`
    - Implement sendEmail function (placeholder for Gmail API)
    - Implement email logging to Firestore
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [ ]* 16.2 Write property test for email logging
    - **Property 10: Email log completeness**
    - **Validates: Requirements 8.3**
  - [ ] 16.3 Create email log repository
    - Create `packages/firebase/src/repositories/email-log.repository.ts`
    - CRUD operations for email logs
    - _Requirements: 8.3_

- [ ] 17. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
