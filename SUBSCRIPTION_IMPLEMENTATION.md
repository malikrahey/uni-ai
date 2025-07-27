# Subscription-Based Access Control Implementation

This document outlines the implementation of subscription-based access control for lesson and degree generation in the UniAI platform.

## Overview

The implementation ensures that users can only generate lessons or degrees if they have an active subscription or valid trial period. The system provides both server-side and client-side validation with clear error messaging and upgrade paths. **Authentication failures automatically redirect users to the homepage where they can log in again.**

## Architecture

### Core Components

1. **Server-Side Validation** (`utils/subscription-check.ts`)
   - Primary validation logic for subscription and trial status
   - Used in API routes to enforce access control
   - Handles both active subscriptions and trial periods
   - **Validates user authentication and redirects to homepage if not authenticated**

2. **API Route Protection** (`app/api/lessons/route.ts`, `app/api/degrees/route.ts`)
   - Updated to include subscription validation before allowing content generation
   - Returns appropriate error responses for users without access
   - **Handles authentication errors with redirect to homepage**

3. **Client-Side Hooks** (`hooks/useSubscriptionGuard.ts`)
   - React hooks for client-side subscription validation
   - Provides user-friendly error messages and upgrade flows
   - **Includes authentication error handling and redirects**

4. **UI Components** (`components/SubscriptionUpgradePrompt.tsx`)
   - Reusable components for showing subscription upgrade prompts
   - Multiple variants for different use cases

5. **Middleware Utilities** (`utils/subscription-guard.ts`)
   - Higher-order functions for protecting API routes
   - Consistent error handling across endpoints
   - **Authentication error handling with redirects**

6. **Authentication Error Handler** (`utils/auth-error-handler.ts`)
   - Client-side utility for handling authentication errors
   - Automatic redirects based on error type
   - **Redirects to homepage for authentication failures**

## Implementation Details

### Authentication Error Handling

The system now properly handles authentication failures:

```typescript
// Server-side authentication error response
{
  error: 'Authentication required',
  message: 'Please log in to continue',
  code: 'AUTHENTICATION_REQUIRED',
  redirect: '/'
}
```

### Server-Side Validation

The core validation logic checks for:
- **User authentication** (redirects to homepage if not authenticated)
- Active subscriptions (status: 'active' or 'trialing')
- Valid trial periods (not expired, not used)
- Subscription expiration dates
- Cancellation status

```typescript
// Example usage in API route
import { validateSubscriptionAccess } from '@/utils/subscription-check';

export async function POST(request: NextRequest) {
  const { supabase, user } = await createAuthenticatedClient(request);
  
  // Validate subscription access
  try {
    await validateSubscriptionAccess(user.id, supabase);
  } catch (subscriptionError) {
    // Check if it's an authentication error
    if (subscriptionError.message.includes('Authentication required')) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          message: 'Please log in to continue',
          code: 'AUTHENTICATION_REQUIRED',
          redirect: '/'
        },
        { status: 401 }
      );
    }
    
    // Handle subscription errors
    return NextResponse.json(
      { error: 'Subscription required', code: 'SUBSCRIPTION_REQUIRED' },
      { status: 403 }
    );
  }
  
  // Proceed with content generation...
}
```

### Client-Side Validation

React hooks provide client-side validation for better UX:

```typescript
// Example usage in component
import { useSubscriptionGuard } from '@/hooks/useSubscriptionGuard';
import { useAuthErrorHandler } from '@/utils/auth-error-handler';

function MyComponent() {
  const { canGenerateContent, checkAccess, redirectToUpgrade, redirectToLogin } = useSubscriptionGuard();
  const { handleApiResponse } = useAuthErrorHandler();
  
  const handleGenerateContent = async () => {
    const hasAccess = await checkAccess();
    if (!hasAccess) {
      redirectToLogin(); // Redirects to homepage for authentication
      return;
    }
    
    // Make API call
    const response = await fetch('/api/lessons', {
      method: 'POST',
      // ... request body
    });
    
    // Handle authentication errors
    if (!response.ok) {
      await handleApiResponse(response);
      return;
    }
    
    // Proceed with content generation...
  };
  
  return (
    <button 
      onClick={handleGenerateContent}
      disabled={!canGenerateContent}
    >
      Generate Content
    </button>
  );
}
```

### UI Components

Reusable components for subscription prompts:

```typescript
// Example usage
import { SubscriptionUpgradePrompt } from '@/components/SubscriptionUpgradePrompt';

function ContentGenerationPage() {
  return (
    <div>
      <SubscriptionUpgradePrompt 
        title="Generate Lessons & Degrees"
        variant="banner"
        showTrialInfo={true}
      />
      {/* Content generation form */}
    </div>
  );
}
```

## Error Handling

### Error Codes

- `AUTHENTICATION_REQUIRED`: User needs to log in (redirects to homepage)
- `SUBSCRIPTION_REQUIRED`: User needs to subscribe (redirects to payment page)
- `TRIAL_EXPIRED`: Trial period has ended
- `SUBSCRIPTION_EXPIRED`: Subscription has expired
- `SUBSCRIPTION_CANCELLED`: Subscription is cancelled

### Error Messages

The system provides user-friendly error messages based on the user's specific situation:
- **Authentication failures**: Redirect to homepage for login
- Active subscription users see confirmation
- Trial users see trial expiration information
- Non-subscribers see upgrade prompts
- Expired subscription users see renewal prompts

### Authentication Error Flow

1. **API Call Made**: User attempts to generate content
2. **Authentication Check**: Server validates user session/JWT
3. **Authentication Failure**: If no valid session, return 401 with redirect
4. **Client Redirect**: Frontend automatically redirects to homepage
5. **User Login**: User can log in again on the homepage

## Testing

### Test Endpoint

A test endpoint is available at `/api/test-subscription` to verify the implementation:

- `GET /api/test-subscription`: Returns current subscription status
- `POST /api/test-subscription`: Tests subscription validation

### Testing Scenarios

1. **No Authentication**: User without session gets redirected to homepage
2. **Invalid Token**: User with expired/invalid token gets redirected to homepage
3. **Active Subscription**: User with valid subscription can generate content
4. **Trial Period**: User in trial can generate content
5. **Expired Trial**: User with expired trial cannot generate content
6. **No Subscription**: User without subscription cannot generate content
7. **Cancelled Subscription**: User with cancelled subscription cannot generate content

## Security Considerations

### Server-Side Protection

- All content generation APIs are protected with server-side validation
- **Authentication is validated before subscription checks**
- Client-side validation is for UX only, not security
- Proper error messages that don't leak sensitive information

### Authentication Flow

- **JWT/Session validation** happens first in all protected endpoints
- **Automatic redirects** to homepage for authentication failures
- **No sensitive data** exposed in error messages
- **Graceful degradation** for expired sessions

### Rate Limiting

Consider implementing rate limiting for API endpoints to prevent abuse:
- Limit content generation requests per user
- Implement cooldown periods for failed attempts
- **Rate limit authentication attempts** to prevent brute force

## Usage Examples

### Protecting API Routes

```typescript
// Using the middleware utility
import { withSubscriptionGuard } from '@/utils/subscription-guard';

const protectedHandler = withSubscriptionGuard(async (request, context) => {
  // Your API logic here
  return NextResponse.json({ success: true });
});

export const POST = protectedHandler;
```

### Client-Side Protection

```typescript
// Using the React hook
import { useSubscriptionProtected } from '@/hooks/useSubscriptionGuard';

function ProtectedComponent() {
  const { requireSubscription } = useSubscriptionProtected();
  
  const handleAction = () => {
    if (!requireSubscription()) {
      return; // User will be redirected to homepage or upgrade page
    }
    
    // Proceed with protected action
  };
}
```

### Authentication Error Handling

```typescript
// Using the auth error handler
import { useAuthErrorHandler } from '@/utils/auth-error-handler';

function MyComponent() {
  const { handleApiResponse } = useAuthErrorHandler();
  
  const handleApiCall = async () => {
    const response = await fetch('/api/lessons', {
      method: 'POST',
      // ... request body
    });
    
    if (!response.ok) {
      await handleApiResponse(response); // Handles redirects automatically
      return;
    }
    
    // Process successful response
  };
}
```

### UI Integration

```typescript
// Showing subscription status
import { SubscriptionStatusBadge } from '@/components/SubscriptionUpgradePrompt';

function Header() {
  return (
    <header>
      <SubscriptionStatusBadge />
      {/* Other header content */}
    </header>
  );
}
```

## Configuration

### Environment Variables

No additional environment variables are required. The implementation uses existing:
- Supabase configuration
- Stripe configuration
- Database schema

### Database Schema

The implementation relies on existing tables:
- `subscriptions`: User subscription data
- `user_trials`: User trial period data

## Monitoring and Analytics

### Logging

The implementation includes comprehensive logging:
- **Authentication attempts and failures**
- Subscription validation attempts
- Access denied events
- Error scenarios

### Metrics to Track

- **Authentication success/failure rates**
- Content generation success/failure rates
- Subscription conversion rates
- Trial usage patterns
- Error frequency by type

## Future Enhancements

### Potential Improvements

1. **Caching**: Implement Redis caching for subscription status
2. **Webhooks**: Real-time subscription status updates
3. **Analytics**: Detailed usage analytics
4. **A/B Testing**: Different upgrade prompts
5. **Feature Flags**: Gradual rollout capabilities
6. **Session Management**: Enhanced session handling and refresh

### Scalability Considerations

- Database indexing for subscription queries
- Connection pooling for high traffic
- CDN caching for static assets
- Load balancing for API endpoints
- **JWT token refresh mechanisms**

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Ensure proper type definitions for nullable database fields
2. **Authentication Issues**: Verify Supabase authentication is working
3. **Subscription Sync**: Check Stripe webhook configuration
4. **Trial Creation**: Verify trial creation logic in user registration
5. **Redirect Loops**: Check for circular redirects in authentication flow

### Debug Endpoints

- `/api/test-subscription`: Test subscription validation
- `/api/test-auth`: Test authentication
- Browser console logs for client-side debugging

### Authentication Debugging

- Check browser network tab for 401 responses
- Verify JWT token expiration
- Check Supabase session status
- Monitor redirect chains

## Support

For issues or questions about the subscription implementation:
1. Check the test endpoints
2. Review server logs
3. Verify database schema
4. Test with different user scenarios
5. **Check authentication flow and redirects** 