I'll reorganize the requirements into MVP 0 and Version 1, and add details about login states and user access levels.

# Everybody Votes - Requirements Document

## MVP 0 (Initial Release)

### User Access Levels

#### Unauthenticated Users

- Can view current active questions
- Can see basic results (overall percentages only)
- Cannot vote
- Cannot see demographic breakdowns
- Prompted to sign up to participate and view full results

#### First-Time Authentication

1. **Sign Up Flow**

   - Email/password or social authentication
   - Must complete demographic profile before accessing full features
   - Cannot skip demographic questions
   - Progress indicator showing completion status

2. **Required Demographics**
   - Essential Information:
     - Age
     - Gender
     - Country of residence
   - Extended Information:
     - Race/Ethnicity
     - Income bracket
     - Political affiliation
     - Occupation
     - Country of origin

#### Authenticated Users

- Full access to voting
- Complete access to demographic result breakdowns
- Receive notifications
- Can update demographic information

### Core Features

#### 1. Polling System

- **Question Schedule**

  - 3 country-specific questions
    - Rotate every Tuesday, Thursday, Saturday
    - Multiple choice (2-4 options)
  - 2 global questions
    - Rotate biweekly
    - Multiple choice (2-4 options)

- **Voting and Predection Flow**
  - Vote on the poll
  - And then predict the results

#### 2. Results & Analytics

- **Basic Results**

  - Overall percentages for each option
  - Total vote count
  - Time remaining for active polls

- **Demographic Breakdowns** (Authenticated Only)
  - Filter by single demographic factor:
    - Age groups
    - Gender
    - Location
    - Income brackets
    - Political affiliations
  - Basic visualization:
    - Bar charts
    - Pie charts
    - Percentage breakdowns
- **Viewing Results**

  - View results from previous polls
  - First time viewing experience for results to create a sense of suspense
    - No results until the poll is closed, but can see total votes so far
    - Show how you voted at first
    - The results are in!
    - Show results from everyone who voted on the graph that slowly fills in
    - have a skip button to skip through the animation
  - Show difference in prediction and voting

- **User Profile Statistics**
  - Have general analytics / statistics
    - Show how you voted on each question
    - Show your prediction accuracy
    - Show your correct prediction streak
    - Show your voting with majority streak
    - Show your longest correct prediction streak
    - Show your prediction accuracy over time
    - amount of polls you've voted on
    - amount of polls you've predicted on
    - amount of polls you've voted with majority
    - amount of polls you've predicted correctly
    - clearly indicate how many of the total polls you've voted on and predicted on vs the total polls
      - and then also the total polls they could have voted on and predicted on -- cant vote on previous polls obviously

#### 3. Notifications

- **Push Notifications**

  - New poll alerts
  - Poll closing soon reminders (24h, 1h)
  - Results available notifications

- **In-App Notifications**
  - Visual indicator for new polls
  - Active polls counter
  - Time remaining indicators

### Technical MVP Requirements

#### 1. Database Schema

- **Users Table**

  - Authentication info
  - Basic profile data
  - Notification preferences

- **Demographics Table**

  - All demographic fields
  - Privacy settings per field

- **Questions Table**

  - Question text
  - Start/end dates
  - Question type (country-specific/global)
  - Active status

- **Options Table**

  - Option text
  - Question reference

- **Votes Table**
  - User reference
  - Question reference
  - Option selected
  - Timestamp

#### 2. API Endpoints

- **Authentication**

  - Sign up
  - Login
  - Password reset
  - Profile completion

- **Questions**

  - Get active questions
  - Get question history
  - Get question results

- **Votes**
  - Submit vote
  - Get user's voting history

#### 3. Security & Privacy

- Data encryption at rest
- Secure API endpoints
- Rate limiting
- Input validation
- Basic privacy controls

## Version 1 (Future Release)

### New Features

#### 1. Question Suggestion System

- User submission interface
- Voting mechanism
- Selection criteria
- Implementation process

#### 2. Discussion Feature

- Comment threads
- Moderation tools
- Sorting options
- User reputation system

#### 3. Enhanced Analytics

- Multi-factor demographic analysis
- Custom demographic reports
- Trend analysis
- Data export options

#### 4. Social Features

- Share results
- Friend connections
- Group discussions
- Collaborative analysis

### Technical Additions

#### 1. Additional Schema

- Comments table
- Suggested questions table
- User relationships table
- Enhanced analytics tables

#### 2. New API Endpoints

- Discussion management
- Question suggestions
- Social interactions
- Advanced analytics

Would you like me to expand on any particular section or add more specific details to certain requirements?
