# Reputation System Documentation

The reputation system provides mechanisms for tracking user contributions, awarding points, and unlocking privileges based on reputation thresholds.

## Key Features

- **Reputation Points**: Users earn reputation through various activities
- **Privilege Tiers**: Different actions are unlocked at specific reputation thresholds
- **Badge System**: Achievement badges awarded for specific accomplishments
- **Voting System**: Upvotes and downvotes impact reputation

## Reputation Points

Users can earn (or lose) reputation through the following actions:

| Action | Points | Description |
|--------|--------|-------------|
| Question upvote | +5 | Received when someone upvotes your question |
| Question downvote | -2 | Received when someone downvotes your question |
| Answer upvote | +10 | Received when someone upvotes your answer |
| Answer downvote | -2 | Received when someone downvotes your answer |
| Other content upvote | +2 | Received when someone upvotes your post or comment |
| Other content downvote | -1 | Received when someone downvotes your post or comment |
| Accepted answer | +15 | Received when your answer is accepted |
| Accepting answer | +2 | Received when you accept an answer to your question |
| Submit tool review | +3 | Received when you submit a review for an AI tool |

## Privilege Tiers

As users gain reputation, they unlock additional privileges:

| Reputation | Privilege | Description |
|------------|-----------|-------------|
| 1 | Create Post | Basic privilege to create posts and questions |
| 15 | Upvote | Ability to upvote content |
| 50 | Comment | Ability to add comments |
| 50 | Flag Content | Ability to flag content for moderation |
| 125 | Downvote | Ability to downvote content |
| 250 | First Tier | First milestone of reputation |
| 1,000 | Edit Others | Ability to suggest edits to other users' content |
| 1,000 | Second Tier | Second milestone of reputation |
| 2,000 | Moderation Tools | Access to basic moderation tools |
| 5,000 | Trusted User | Full access to all platform features |
| 5,000 | Third Tier | Third milestone of reputation |

## Badges

Badges are awarded for specific achievements:

| Badge | Level | Description |
|-------|-------|-------------|
| Welcome | Bronze | Complete your profile with avatar and bio |
| First Post | Bronze | Create your first post |
| First Answer | Bronze | Post your first answer |
| Curious | Bronze | Ask your first question |
| Helpful | Bronze | Have an answer accepted |
| Popular Post | Silver | Post with 10+ upvotes |
| Valuable Answer | Silver | Answer with 10+ upvotes |
| Reviewer | Silver | Submit 5+ tool reviews |
| Expert | Gold | Answer with 25+ upvotes |
| Great Question | Gold | Question with 25+ upvotes |

## API Endpoints

### Reputation

**Get Reputation History**
```
GET /api/users/:userId/reputation/history
```
Query parameters:
- `limit` (optional): Number of entries to return (default: 20)
- `offset` (optional): Offset for pagination (default: 0)

Authorization:
- Users can only view their own reputation history
- Admins/moderators can view any user's history

**Get Reputation Statistics**
```
GET /api/users/:userId/reputation/stats
```
Returns:
- `total`: Total reputation score
- `byReason`: Breakdown of reputation by reason
- `rank`: User's rank compared to other users
- `percentile`: Percentile ranking

### Privileges

**Get User Privileges**
```
GET /api/users/:userId/privileges
```
Returns:
- `privileges`: Array of privileges the user has access to
- `thresholds`: Object mapping privilege types to required reputation

### Badges

**Get User Badges**
```
GET /api/users/:userId/badges
```
Returns:
- Array of badges awarded to the user, including award date

**Check and Award Badges**
```
POST /api/users/:userId/badges/check
```
Authorization:
- Users can only check their own badges
- Admins can check any user's badges

Returns:
- `awardedCount`: Number of new badges awarded
- `newBadges`: Array of newly awarded badges

## Implementation Details

The reputation system is implemented using the following components:

1. **ReputationRepository**: Manages reputation points and privileges
2. **BadgeRepository**: Manages badge awards and checks
3. **Database Triggers**: Automatically check for badge eligibility on relevant actions
4. **Database Functions**: Handle complex operations like voting and reputation updates

## Integration with Other Systems

The reputation system integrates with:

- **Content System**: For upvotes, downvotes, and accepted answers
- **User System**: For tracking overall reputation
- **Notification System**: For notifying users of badge awards
- **Moderation System**: For privilege-based access to moderation features
- **Tool Directory**: For reviews and vendor reputation