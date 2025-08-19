# User Profile Management Interface

## Overview
Comprehensive user profile management interface integrated with the existing authentication system, providing secure profile editing, settings management, and account preferences.

## Profile Layout Structure

### Desktop Profile Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ TOP NAVIGATION BAR                                                  │
│ Dashboard > Profile Settings                                        │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│ PROFILE HEADER                                                      │
│ ┌─────────────┐ ┌─────────────────────────────────────────────────┐ │
│ │   AVATAR    │ │  USER INFO                                      │ │
│ │    IMAGE    │ │  John Doe                                       │ │
│ │     📷      │ │  john.doe@example.com                           │ │
│ │             │ │  Member since: January 2024                     │ │
│ │  [Upload]   │ │  Last login: 2 hours ago                        │ │
│ └─────────────┘ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│ PROFILE TABS                                                        │
│ [Personal Info] [Security] [Preferences] [Privacy] [Account]        │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│ TAB CONTENT AREA                                                    │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ PERSONAL INFORMATION FORM                                       │ │
│ │                                                                 │ │
│ │ First Name: [John                    ]                          │ │
│ │ Last Name:  [Doe                     ]                          │ │
│ │ Email:      [john.doe@example.com    ] (verified ✓)            │ │
│ │ Phone:      [+1 (555) 123-4567       ]                          │ │
│ │ Location:   [San Francisco, CA       ]                          │ │
│ │ Bio:        [Software developer...   ]                          │ │
│ │                                                                 │ │
│ │ [Cancel]                                    [Save Changes]      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile Profile Layout
```
┌─────────────────────────────┐
│ ← Profile Settings          │
└─────────────────────────────┘
┌─────────────────────────────┐
│    PROFILE SUMMARY          │
│                             │
│      ┌─────────┐            │
│      │  AVATAR │            │
│      │   📷    │            │
│      └─────────┘            │
│                             │
│      John Doe               │
│   john@example.com          │
│                             │
│   [Change Photo]            │
└─────────────────────────────┘
┌─────────────────────────────┐
│ PROFILE SECTIONS            │
│                             │
│ Personal Information    >   │
│ Security Settings       >   │
│ Preferences            >   │
│ Privacy Controls       >   │
│ Account Management     >   │
│                             │
└─────────────────────────────┘
```

## Profile Sections

### 1. Personal Information

#### Desktop Form Layout
```html
<form class="profile-form" aria-labelledby="personal-info-title">
  <h2 id="personal-info-title" class="section-title">Personal Information</h2>
  
  <div class="form-grid">
    <div class="form-group">
      <label for="first-name" class="form-label">
        First Name
        <span class="required" aria-label="required">*</span>
      </label>
      <input 
        type="text" 
        id="first-name" 
        name="firstName"
        class="form-input"
        value="John"
        required
        autocomplete="given-name"
        aria-describedby="first-name-help"
      >
      <div id="first-name-help" class="form-help">
        Your first name as it appears on official documents
      </div>
    </div>
    
    <div class="form-group">
      <label for="last-name" class="form-label">
        Last Name
        <span class="required" aria-label="required">*</span>
      </label>
      <input 
        type="text" 
        id="last-name" 
        name="lastName"
        class="form-input"
        value="Doe"
        required
        autocomplete="family-name"
      >
    </div>
    
    <div class="form-group form-group-full">
      <label for="email" class="form-label">
        Email Address
        <span class="required" aria-label="required">*</span>
      </label>
      <div class="input-with-status">
        <input 
          type="email" 
          id="email" 
          name="email"
          class="form-input"
          value="john.doe@example.com"
          required
          autocomplete="email"
          aria-describedby="email-status email-help"
        >
        <div class="input-status verified" id="email-status">
          <span class="status-icon" aria-hidden="true">✓</span>
          Verified
        </div>
      </div>
      <div id="email-help" class="form-help">
        Email changes require verification. You'll receive a confirmation email.
      </div>
    </div>
    
    <div class="form-group">
      <label for="phone" class="form-label">Phone Number</label>
      <input 
        type="tel" 
        id="phone" 
        name="phone"
        class="form-input"
        value="+1 (555) 123-4567"
        autocomplete="tel"
        aria-describedby="phone-help"
      >
      <div id="phone-help" class="form-help">
        Used for security notifications and account recovery
      </div>
    </div>
    
    <div class="form-group">
      <label for="location" class="form-label">Location</label>
      <input 
        type="text" 
        id="location" 
        name="location"
        class="form-input"
        value="San Francisco, CA"
        autocomplete="address-level2"
        placeholder="City, State/Province, Country"
      >
    </div>
    
    <div class="form-group form-group-full">
      <label for="bio" class="form-label">
        Bio
        <span class="character-count" aria-live="polite">
          <span id="bio-count">120</span>/500 characters
        </span>
      </label>
      <textarea 
        id="bio" 
        name="bio"
        class="form-textarea"
        rows="4"
        maxlength="500"
        aria-describedby="bio-help"
        oninput="updateCharacterCount('bio', 'bio-count')"
      >Software developer passionate about creating accessible web applications.</textarea>
      <div id="bio-help" class="form-help">
        Tell others about yourself. This information may be visible to other users.
      </div>
    </div>
  </div>
  
  <div class="form-actions">
    <button type="button" class="btn btn-secondary">
      Cancel
    </button>
    <button type="submit" class="btn btn-primary">
      Save Changes
    </button>
  </div>
</form>
```

### 2. Security Settings

#### Password Change Section
```html
<section class="security-section" aria-labelledby="password-title">
  <h3 id="password-title" class="subsection-title">Password & Authentication</h3>
  
  <div class="security-item">
    <div class="security-info">
      <h4>Password</h4>
      <p class="security-description">
        Last changed: 3 months ago
        <span class="security-status weak">Consider updating</span>
      </p>
    </div>
    <button class="btn btn-secondary" onclick="openPasswordModal()">
      Change Password
    </button>
  </div>
  
  <div class="security-item">
    <div class="security-info">
      <h4>Two-Factor Authentication</h4>
      <p class="security-description">
        Add an extra layer of security to your account
        <span class="security-status disabled">Not enabled</span>
      </p>
    </div>
    <button class="btn btn-primary" onclick="setup2FA()">
      Enable 2FA
    </button>
  </div>
  
  <div class="security-item">
    <div class="security-info">
      <h4>Active Sessions</h4>
      <p class="security-description">
        Manage devices that are currently signed in
        <span class="session-count">3 active sessions</span>
      </p>
    </div>
    <button class="btn btn-secondary" onclick="viewSessions()">
      Manage Sessions
    </button>
  </div>
</section>

<!-- Password Change Modal -->
<div id="password-modal" class="modal" role="dialog" aria-labelledby="password-modal-title" aria-hidden="true">
  <div class="modal-backdrop" onclick="closePasswordModal()"></div>
  <div class="modal-content">
    <div class="modal-header">
      <h2 id="password-modal-title">Change Password</h2>
      <button class="modal-close" onclick="closePasswordModal()" aria-label="Close dialog">
        <span aria-hidden="true">×</span>
      </button>
    </div>
    
    <form class="modal-body" onsubmit="handlePasswordChange(event)">
      <div class="form-group">
        <label for="current-password" class="form-label">
          Current Password
          <span class="required" aria-label="required">*</span>
        </label>
        <input 
          type="password" 
          id="current-password" 
          name="currentPassword"
          class="form-input"
          required
          autocomplete="current-password"
        >
      </div>
      
      <div class="form-group">
        <label for="new-password" class="form-label">
          New Password
          <span class="required" aria-label="required">*</span>
        </label>
        <input 
          type="password" 
          id="new-password" 
          name="newPassword"
          class="form-input"
          required
          autocomplete="new-password"
          aria-describedby="password-requirements"
        >
        <div id="password-requirements" class="password-strength">
          <div class="strength-meter">
            <div class="strength-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="4"></div>
          </div>
          <ul class="requirements-list">
            <li class="requirement" data-requirement="length">At least 8 characters</li>
            <li class="requirement" data-requirement="uppercase">One uppercase letter</li>
            <li class="requirement" data-requirement="lowercase">One lowercase letter</li>
            <li class="requirement" data-requirement="number">One number</li>
            <li class="requirement" data-requirement="special">One special character</li>
          </ul>
        </div>
      </div>
      
      <div class="form-group">
        <label for="confirm-password" class="form-label">
          Confirm New Password
          <span class="required" aria-label="required">*</span>
        </label>
        <input 
          type="password" 
          id="confirm-password" 
          name="confirmPassword"
          class="form-input"
          required
          autocomplete="new-password"
        >
      </div>
      
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" onclick="closePasswordModal()">
          Cancel
        </button>
        <button type="submit" class="btn btn-primary">
          Update Password
        </button>
      </div>
    </form>
  </div>
</div>
```

### 3. Preferences & Settings

#### Accessibility Preferences
```html
<section class="preferences-section" aria-labelledby="accessibility-title">
  <h3 id="accessibility-title" class="subsection-title">Accessibility Preferences</h3>
  
  <div class="preference-group">
    <div class="preference-item">
      <div class="preference-info">
        <h4>Reduced Motion</h4>
        <p class="preference-description">
          Minimize animations and transitions for a calmer experience
        </p>
      </div>
      <div class="preference-control">
        <label class="toggle-switch">
          <input 
            type="checkbox" 
            name="reducedMotion"
            aria-describedby="reduced-motion-help"
          >
          <span class="toggle-slider" aria-hidden="true"></span>
          <span class="sr-only">Enable reduced motion</span>
        </label>
      </div>
    </div>
    
    <div class="preference-item">
      <div class="preference-info">
        <h4>High Contrast Mode</h4>
        <p class="preference-description">
          Increase color contrast for better visibility
        </p>
      </div>
      <div class="preference-control">
        <label class="toggle-switch">
          <input 
            type="checkbox" 
            name="highContrast"
            aria-describedby="high-contrast-help"
          >
          <span class="toggle-slider" aria-hidden="true"></span>
          <span class="sr-only">Enable high contrast mode</span>
        </label>
      </div>
    </div>
    
    <div class="preference-item">
      <div class="preference-info">
        <h4>Font Size</h4>
        <p class="preference-description">
          Adjust text size for comfortable reading
        </p>
      </div>
      <div class="preference-control">
        <select 
          name="fontSize" 
          class="form-select"
          aria-label="Select font size"
        >
          <option value="small">Small</option>
          <option value="medium" selected>Medium</option>
          <option value="large">Large</option>
          <option value="extra-large">Extra Large</option>
        </select>
      </div>
    </div>
  </div>
</section>

<!-- Theme Preferences -->
<section class="preferences-section" aria-labelledby="theme-title">
  <h3 id="theme-title" class="subsection-title">Theme & Appearance</h3>
  
  <div class="theme-selector">
    <fieldset>
      <legend class="form-label">Choose your preferred theme</legend>
      
      <div class="theme-options">
        <label class="theme-option">
          <input type="radio" name="theme" value="light" checked>
          <div class="theme-preview light-theme">
            <div class="theme-header"></div>
            <div class="theme-content">
              <div class="theme-text"></div>
              <div class="theme-text short"></div>
            </div>
          </div>
          <span class="theme-label">Light Mode</span>
        </label>
        
        <label class="theme-option">
          <input type="radio" name="theme" value="dark">
          <div class="theme-preview dark-theme">
            <div class="theme-header"></div>
            <div class="theme-content">
              <div class="theme-text"></div>
              <div class="theme-text short"></div>
            </div>
          </div>
          <span class="theme-label">Dark Mode</span>
        </label>
        
        <label class="theme-option">
          <input type="radio" name="theme" value="auto">
          <div class="theme-preview auto-theme">
            <div class="theme-header"></div>
            <div class="theme-content">
              <div class="theme-text"></div>
              <div class="theme-text short"></div>
            </div>
          </div>
          <span class="theme-label">System Default</span>
        </label>
      </div>
    </fieldset>
  </div>
</section>
```

### 4. Privacy Controls

#### Data & Privacy Settings
```html
<section class="privacy-section" aria-labelledby="privacy-title">
  <h3 id="privacy-title" class="subsection-title">Data & Privacy</h3>
  
  <div class="privacy-item">
    <div class="privacy-info">
      <h4>Profile Visibility</h4>
      <p class="privacy-description">
        Control who can see your profile information
      </p>
    </div>
    <div class="privacy-control">
      <select name="profileVisibility" class="form-select" aria-label="Profile visibility setting">
        <option value="public">Public - Anyone can see</option>
        <option value="members" selected>Members only</option>
        <option value="private">Private - Only you</option>
      </select>
    </div>
  </div>
  
  <div class="privacy-item">
    <div class="privacy-info">
      <h4>Activity Status</h4>
      <p class="privacy-description">
        Show when you're online and your last activity
      </p>
    </div>
    <div class="privacy-control">
      <label class="toggle-switch">
        <input type="checkbox" name="showActivityStatus" checked>
        <span class="toggle-slider" aria-hidden="true"></span>
        <span class="sr-only">Show activity status</span>
      </label>
    </div>
  </div>
  
  <div class="privacy-item">
    <div class="privacy-info">
      <h4>Data Export</h4>
      <p class="privacy-description">
        Download a copy of your personal data
      </p>
    </div>
    <div class="privacy-control">
      <button class="btn btn-secondary" onclick="requestDataExport()">
        Request Export
      </button>
    </div>
  </div>
  
  <div class="privacy-item danger-zone">
    <div class="privacy-info">
      <h4>Delete Account</h4>
      <p class="privacy-description">
        Permanently delete your account and all associated data
      </p>
    </div>
    <div class="privacy-control">
      <button class="btn btn-danger" onclick="showDeleteConfirmation()">
        Delete Account
      </button>
    </div>
  </div>
</section>
```

## Integration with Authentication System

### API Integration Points

#### Profile Update Endpoint
```typescript
// Profile update service integration
interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  preferences?: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  profileVisibility: 'public' | 'members' | 'private';
  showActivityStatus: boolean;
}

// Service function
async function updateProfile(data: ProfileUpdateRequest): Promise<AuthenticatedUser> {
  const response = await fetch('/api/auth/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAccessToken()}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update profile');
  }
  
  return response.json();
}
```

#### Password Change Integration
```typescript
interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

async function changePassword(data: PasswordChangeRequest): Promise<void> {
  const response = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAccessToken()}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to change password');
  }
  
  // Notify user of successful password change
  showSuccessMessage('Password updated successfully');
}
```

## Mobile-Specific Considerations

### Touch-Optimized Interactions
- Minimum 44px touch targets
- Swipe gestures for tab navigation
- Pull-to-refresh for profile data
- Haptic feedback for form submissions

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced interactions with JavaScript enabled
- Offline form draft saving
- Network-aware form submission

### Performance Optimizations
- Lazy loading of non-critical sections
- Image optimization for avatars
- Debounced form validation
- Efficient state management

## Security Considerations

### Data Validation
- Client-side validation for UX
- Server-side validation for security
- Input sanitization and escaping
- CSRF protection on all forms

### Privacy Protection
- Sensitive data handling protocols
- Audit logging for profile changes
- Email verification for email changes
- Secure file upload for avatars

### Session Management
- Session timeout handling
- Concurrent session limits
- Device fingerprinting for security
- Logout from all devices option