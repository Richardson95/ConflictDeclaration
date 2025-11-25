# API Integration Documentation

This document provides a comprehensive guide to the integrated backend API endpoints for the InfraCredit Conflict Declaration system.

## Table of Contents
- [Setup](#setup)
- [API Services](#api-services)
- [Usage Examples](#usage-examples)
- [API Endpoints Reference](#api-endpoints-reference)

## Setup

### Base URL
The API base URL is configured in `src/lib/redux/baseUrl.tsx`:
```typescript
export const baseUrl = 'https://customer-backend-dnry.onrender.com/';
```

### Authentication
All API requests automatically include the JWT token from Redux state in the Authorization header:
```
Authorization: Bearer <token>
```

The token is managed by the `authSlice` and persisted in cookies.

## API Services

All services are built using **RTK Query** and are located in `src/lib/redux/services/`:

1. **authApi** - Authentication endpoints
2. **employeeApi** - Employee management
3. **declarationApi** - Declaration management
4. **counterpartyApi** - Counterparty and conflict checking
5. **adminApi** - Admin operations and settings

## Usage Examples

### 1. Authentication Service

#### Login
```tsx
import { useLoginMutation } from '@/lib/redux/services/auth.service';

const LoginComponent = () => {
  const [login, { isLoading, error }] = useLoginMutation();

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await login({ email, password }).unwrap();
      // Handle successful login
      console.log(result.data, result.token);
    } catch (err) {
      // Handle error
      console.error(err);
    }
  };
};
```

### 2. Employee Service

#### Get All Employees
```tsx
import { useGetEmployeesQuery } from '@/lib/redux/services/employee.service';

const EmployeesPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    searchTerm: ''
  });

  const { data, isLoading, error } = useGetEmployeesQuery({
    filters,
    page,
    limit: 10,
    year: 2025
  });

  return (
    <div>
      {data?.data.map(employee => (
        <div key={employee._id}>{employee.fullName}</div>
      ))}
    </div>
  );
};
```

#### Get Employee by ID
```tsx
const { data, isLoading } = useGetEmployeeByIdQuery('employee-id');
```

#### Send Employee Notification
```tsx
import { useSendEmployeeNotificationMutation } from '@/lib/redux/services/employee.service';

const [sendNotification] = useSendEmployeeNotificationMutation();

const handleNotify = async (employeeId: string) => {
  try {
    await sendNotification({
      employeeId,
      message: 'Please complete your declaration'
    }).unwrap();
    // Success
  } catch (err) {
    // Error
  }
};
```

#### Download Employee Report
```tsx
import { useDownloadEmployeeReportMutation } from '@/lib/redux/services/employee.service';

const [downloadReport] = useDownloadEmployeeReportMutation();

const handleDownload = async () => {
  try {
    const blob = await downloadReport({
      year: 2025,
      filters: { status: 'Completed' }
    }).unwrap();

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees-report-2025.pdf`;
    a.click();
  } catch (err) {
    console.error(err);
  }
};
```

### 3. Declaration Service

#### Submit Declaration
```tsx
import { useSubmitDeclarationMutation } from '@/lib/redux/services/declaration.service';

const [submitDeclaration, { isLoading }] = useSubmitDeclarationMutation();

const handleSubmit = async (formData) => {
  try {
    const result = await submitDeclaration({
      employeeId: 'employee-id',
      year: 2025,
      answers: formData.answers,
      policyAgreed: true
    }).unwrap();

    console.log('Declaration submitted:', result.data);
  } catch (err) {
    console.error(err);
  }
};
```

#### Get Declaration History
```tsx
import { useGetDeclarationHistoryQuery } from '@/lib/redux/services/declaration.service';

const { data, isLoading } = useGetDeclarationHistoryQuery({ year: 2025 });
```

#### Get Current Declaration
```tsx
import { useGetCurrentDeclarationQuery } from '@/lib/redux/services/declaration.service';

const { data, isLoading } = useGetCurrentDeclarationQuery({ year: 2025 });

// Check if user has already submitted for this year
const hasSubmitted = data?.data !== null;
```

#### Download Certificate
```tsx
import { useDownloadDeclarationCertificateMutation } from '@/lib/redux/services/declaration.service';

const [downloadCertificate] = useDownloadDeclarationCertificateMutation();

const handleDownloadCertificate = async (declarationId: string) => {
  try {
    const blob = await downloadCertificate({ declarationId }).unwrap();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `declaration-certificate.pdf`;
    a.click();
  } catch (err) {
    console.error(err);
  }
};
```

### 4. Counterparty Service

#### Get All Counterparties
```tsx
import { useGetCounterpartiesQuery } from '@/lib/redux/services/counterparty.service';

const { data, isLoading } = useGetCounterpartiesQuery({
  filters: {
    sector: 'Banking',
    hasConflict: true,
    searchTerm: 'Access',
    year: 2025
  },
  page: 1,
  limit: 10
});
```

#### Check Conflict
```tsx
import { useCheckConflictMutation } from '@/lib/redux/services/counterparty.service';

const [checkConflict, { isLoading }] = useCheckConflictMutation();

const handleCheckConflict = async (counterpartyId: string) => {
  try {
    const result = await checkConflict({
      counterpartyId,
      year: 2025
    }).unwrap();

    console.log('Conflict check result:', result.data);
    console.log('Has conflict:', result.data.hasConflict);
    console.log('Conflicted employees:', result.data.conflictedEmployees);
  } catch (err) {
    console.error(err);
  }
};
```

#### Get Conflict Check History
```tsx
import { useGetConflictCheckHistoryQuery } from '@/lib/redux/services/counterparty.service';

const { data, isLoading } = useGetConflictCheckHistoryQuery({
  year: 2025,
  page: 1,
  limit: 10
});
```

### 5. Admin Service

#### Get Dashboard Statistics
```tsx
import { useGetDashboardStatsQuery } from '@/lib/redux/services/admin.service';

const { data, isLoading } = useGetDashboardStatsQuery({ year: 2025 });

// Access stats
const stats = data?.data;
console.log(stats?.totalEmployees);
console.log(stats?.complianceRate);
console.log(stats?.recentActivity);
```

#### Update Admin Settings
```tsx
import { useUpdateAdminSettingsMutation } from '@/lib/redux/services/admin.service';

const [updateSettings] = useUpdateAdminSettingsMutation();

const handleUpdateSettings = async () => {
  try {
    await updateSettings({
      declarationDeadline: '2025-12-31',
      reminderFrequency: 7,
      autoNotifyPending: true,
      emailNotifications: true
    }).unwrap();

    // Success
  } catch (err) {
    console.error(err);
  }
};
```

#### Send Bulk Notification
```tsx
import { useSendBulkNotificationMutation } from '@/lib/redux/services/admin.service';

const [sendBulkNotification] = useSendBulkNotificationMutation();

const handleSendNotification = async () => {
  try {
    const result = await sendBulkNotification({
      recipientType: 'pending', // 'all' | 'pending' | 'specific'
      subject: 'Declaration Reminder',
      message: 'Please complete your conflict declaration.'
    }).unwrap();

    console.log(`Sent to ${result.sentCount} employees`);
  } catch (err) {
    console.error(err);
  }
};
```

## API Endpoints Reference

### Authentication API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/login` | User login |

### Employee API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees` | Get all employees with filters |
| GET | `/employees/:id` | Get employee by ID |
| GET | `/employees/:id/declarations` | Get employee's declarations |
| POST | `/employees/notify` | Send notification to employee |
| GET | `/employees/report` | Download employee report |
| GET | `/employees/stats` | Get employee statistics |

### Declaration API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/declarations` | Get all declarations (admin) |
| GET | `/declarations/:id` | Get declaration by ID |
| GET | `/declarations/history` | Get user's declaration history |
| GET | `/declarations/current` | Get current year declaration |
| POST | `/declarations` | Submit new declaration |
| PUT | `/declarations/:id` | Update declaration |
| DELETE | `/declarations/:id` | Delete declaration |
| GET | `/declarations/policy` | Get policy document |
| GET | `/declarations/companies` | Get companies list |
| GET | `/declarations/:id/certificate` | Download certificate |
| GET | `/declarations/stats` | Get declaration statistics |

### Counterparty API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/counterparties` | Get all counterparties |
| GET | `/counterparties/:id` | Get counterparty by ID |
| POST | `/counterparties/check-conflict` | Check conflict |
| GET | `/counterparties/conflict-checks` | Get conflict check history |
| POST | `/counterparties` | Create counterparty |
| PUT | `/counterparties/:id` | Update counterparty |
| DELETE | `/counterparties/:id` | Delete counterparty |
| GET | `/counterparties/sectors` | Get all sectors |
| GET | `/counterparties/stats` | Get statistics |

### Admin API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard/stats` | Get dashboard statistics |
| GET | `/admin/settings` | Get admin settings |
| PUT | `/admin/settings` | Update admin settings |
| POST | `/admin/notifications/send` | Send bulk notifications |
| GET | `/admin/notifications/history` | Get notification history |
| GET | `/admin/reports/download` | Download comprehensive report |
| GET | `/admin/audit-logs` | Get audit logs |
| GET | `/admin/system/health` | Get system health status |

## Error Handling

All API calls should be wrapped in try-catch blocks:

```tsx
try {
  const result = await apiCall().unwrap();
  // Handle success
} catch (error) {
  if (error.status === 401) {
    // Handle unauthorized
  } else if (error.status === 404) {
    // Handle not found
  } else {
    // Handle other errors
  }
}
```

## Automatic Cache Invalidation

RTK Query automatically invalidates and refetches data when mutations are performed. Tags are configured to ensure data consistency:

- Creating/updating/deleting an entity invalidates its list
- Submitting a declaration invalidates declaration history
- Checking conflicts invalidates counterparty data

## Best Practices

1. **Use hooks in components**: All RTK Query hooks should be used inside React components or custom hooks
2. **Handle loading states**: Always show loading indicators when `isLoading` is true
3. **Handle errors**: Display user-friendly error messages
4. **Optimistic updates**: Use RTK Query's optimistic update feature for better UX
5. **Pagination**: Always implement pagination for large datasets
6. **Caching**: RTK Query automatically caches responses; use `refetch` when needed

## TypeScript Support

All services are fully typed. Import interfaces from:

```tsx
import type {
  IEmployee,
  IDeclaration,
  ICounterparty
} from '@/lib/interfaces';
```

## Next Steps

1. Replace mock data in pages with actual API calls
2. Implement error boundaries for API errors
3. Add loading skeletons for better UX
4. Implement retry logic for failed requests
5. Add offline support with Redux Persist
