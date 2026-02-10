# Role-Based Access Control Implementation Summary

## Role Definitions (Backend ERole enum)

```csharp
public enum ERole
{
    Employee = 1,
    ITAdmin = 4,
    Leadership = 5,
    RiskAndCompliance = 6,
    HeadOfCompliance = 7
}
```

## Admin Access Rules

**Users with Admin Panel Access:**
- **ITAdmin (role = 4)** ✅
- **Leadership (role = 5)** ✅
- **Risk and Compliance (role = 6)** ✅
- **Head of Compliance (role = 7)** ✅

**Users WITHOUT Admin Panel Access:**
- Employee (role = 1) ❌

---

## Implementation Details

### 1. Role Constants File
**Location:** `src/lib/constants/roles.ts`

Created a centralized file for role management with:
- `UserRole` enum matching backend roles
- `hasAdminAccess(role)` - Returns true for ITAdmin (4), Leadership (5), Risk and Compliance (6), or Head of Compliance (7)
- `isLeadership(role)` - Checks specifically for Leadership role
- `isITAdmin(role)` - Checks specifically for ITAdmin role
- `getRoleName(role)` - Returns human-readable role name

### 2. JWT Token Authentication
**Location:** `src/lib/redux/services/auth.service.ts` (lines 28-39)

The JWT token is automatically included in all API requests:

```typescript
prepareHeaders: (headers, { getState }) => {
  // Try to get token from Redux state first, then from cookies
  const { token: stateToken } = (getState() as RootState).auth;
  const cookieToken = Cookies.get('token');
  const token = stateToken || cookieToken;

  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }
  headers.set('Content-Type', 'application/json');
  return headers;
}
```

**Token Sources (in priority order):**
1. Redux state (`state.auth.token`)
2. Browser cookies (`Cookies.get('token')`)

**Header Format:** `Authorization: Bearer {jwt_token}`

### 3. Users/me API Endpoint
**Endpoint:** `GET /api/v1/Users/me`

**Request Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Response Example:**
```json
{
  "data": {
    "id": "9c5dfb86-cc47-4df7-235a-08de2e622a5e",
    "department": {
      "id": "0a51715f-f99e-4de9-b9f4-08de2e848797",
      "code": "FNE",
      "name": "Finance",
      "description": "Finance"
    },
    "firstName": "Board",
    "lastName": "Meeting",
    "email": "adetop99@gmail.com",
    "role": 1,
    "status": 1
  },
  "message": "User details retrieved successfully",
  "success": true
}
```

### 4. Frontend Access Control

#### A. Navigation Header (`src/lib/layout/MobileNav.tsx`)
- Fetches current user via `useGetCurrentUserQuery()`
- Checks role using `hasAdminAccess(currentUser?.role)`
- Shows/hides "Admin Panel" button based on role
- JWT token automatically included in API call

#### B. Admin Layout (`src/lib/layout/AdminLayout.tsx`)
- Fetches current user on page load
- Validates role using `hasAdminAccess(currentUser.role)`
- If not Admin/ITAdmin:
  - Shows error toast: "Access Denied"
  - Redirects to `/dashboard`
- JWT token automatically included in API call

---

## Access Control Flow

### For Admin Users (role = 4, 5, 6, or 7):

```
1. User logs in via Azure AD
2. JWT token stored in cookies and Redux
3. Users/me API called with JWT token
4. Backend validates JWT and returns user data with role = 4, 5, 6, or 7
5. Frontend checks: hasAdminAccess(4) → true ✅
6. "Admin Panel" button visible in dropdown
7. User can click and access /admin routes
8. AdminLayout validates role again on page load
9. Access granted ✅
```

### For Regular Users (role = 1):

```
1. User logs in via Azure AD
2. JWT token stored in cookies and Redux
3. Users/me API called with JWT token
4. Backend validates JWT and returns user data with role = 1
5. Frontend checks: hasAdminAccess(1) → false ❌
6. "Admin Panel" button NOT visible in dropdown
7. If user manually navigates to /admin:
   - AdminLayout calls Users/me with JWT token
   - Backend returns role = 1
   - hasAdminAccess(1) → false ❌
   - Error toast displayed
   - Redirect to /dashboard
8. Access denied ❌
```

---

## Security Layers

### Layer 1: UI Level
- Admin Panel button hidden for non-admin users
- JWT token required for API calls

### Layer 2: Route Protection
- AdminLayout validates role on mount
- Redirects non-admin users to dashboard
- JWT token validated by backend

### Layer 3: API Level (Backend)
- All API endpoints validate JWT token
- Backend checks user role before allowing actions
- Returns 401/403 for unauthorized access

---

## Testing Checklist

### For Admin Users (role = 4, 5, 6, 7):
- [x] Can see "Admin Panel" button in dropdown menu
- [x] Can click and access /admin routes
- [x] Can view admin dashboard
- [x] Can access admin features based on role
- [x] JWT token sent with all requests

### For Non-Admin (role = 1):
- [x] Cannot see "Admin Panel" button
- [x] If accessing /admin directly → redirected to dashboard
- [x] See error message: "Access Denied"
- [x] All regular dashboard features work normally
- [x] JWT token sent with all requests

---

## Files Modified

1. ✅ `src/lib/constants/roles.ts` - Created role constants and helper functions
2. ✅ `src/lib/layout/MobileNav.tsx` - Updated to check Admin/ITAdmin roles (3, 4)
3. ✅ `src/lib/layout/AdminLayout.tsx` - Updated to validate Admin/ITAdmin access
4. ✅ `src/lib/redux/services/auth.service.ts` - Already configured with JWT token in headers

---

## Important Notes

⚠️ **JWT Token is Already Configured**
- Token automatically extracted from Redux state or cookies
- Automatically included in all API requests as `Authorization: Bearer {token}`
- No additional configuration needed

⚠️ **Backend Validation Required**
- Frontend checks prevent UI access
- Backend must also validate roles on API endpoints
- Never trust client-side role checks alone

⚠️ **Role Numbers Must Match**
- Frontend: `ITAdmin = 4, Leadership = 5, RiskAndCompliance = 6, HeadOfCompliance = 7`
- Backend: `ITAdmin = 4, Leadership = 5, RiskAndCompliance = 6, HeadOfCompliance = 7`
- Any mismatch will break access control
