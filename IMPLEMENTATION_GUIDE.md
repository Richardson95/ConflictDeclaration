# Implementation Guide: Replacing Mock Data with API Calls

This guide shows how to replace mock data with real API calls in your pages.

## Example 1: Employees Page

### Before (Mock Data)
```tsx
// src/lib/pages/admin/employees/index.tsx
const mockEmployees: IEmployee[] = Array.from({ length: 512 }, ...);

const EmployeesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const filteredData = useMemo(() => {
    return mockEmployees.filter((item) => {
      // Client-side filtering
    });
  }, [searchQuery, selectedStatus]);
};
```

### After (API Integration)
```tsx
// src/lib/pages/admin/employees/index.tsx
import {
  useGetEmployeesQuery,
  useGetEmployeeStatsQuery,
  useSendEmployeeNotificationMutation,
  useDownloadEmployeeReportMutation
} from '@/lib/redux/services/employee.service';

const EmployeesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState(2025);

  // Fetch employees with filters
  const { data: employeesData, isLoading, error } = useGetEmployeesQuery({
    filters: {
      status: selectedStatus,
      department: selectedDepartment,
      searchTerm: searchQuery,
    },
    page: currentPage,
    limit: itemsPerPage,
    year: selectedYear,
  });

  // Fetch employee statistics
  const { data: statsData } = useGetEmployeeStatsQuery({ year: selectedYear });

  // Notification mutation
  const [sendNotification] = useSendEmployeeNotificationMutation();

  // Download report mutation
  const [downloadReport, { isLoading: isDownloading }] = useDownloadEmployeeReportMutation();

  // Handle notification
  const handleNotifyEmployee = async (employeeId: string) => {
    try {
      await sendNotification({
        employeeId,
        message: 'Please complete your declaration'
      }).unwrap();

      // Show success toast
      console.log('Notification sent successfully');
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  };

  // Handle report download
  const handleDownloadReport = async () => {
    try {
      const blob = await downloadReport({
        year: selectedYear,
        filters: {
          status: selectedStatus,
          department: selectedDepartment,
          searchTerm: searchQuery,
        }
      }).unwrap();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees-report-${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download report:', err);
    }
  };

  // Chart data from stats
  const chartData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [
          statsData?.data?.completed || 0,
          statsData?.data?.pending || 0
        ],
        backgroundColor: ['#47B65C', '#D1D5DB'],
        borderWidth: 0,
      },
    ],
  };

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (error) {
    return <ErrorMessage error={error} />;
  }

  const employees = employeesData?.data || [];
  const totalEmployees = employeesData?.total || 0;
  const totalPages = Math.ceil(totalEmployees / itemsPerPage);

  return (
    <AdminLayout>
      {/* Use employees and statsData instead of mockEmployees */}
      <Box>
        {employees.map((employee) => (
          <EmployeeRow
            key={employee._id}
            employee={employee}
            onNotify={handleNotifyEmployee}
          />
        ))}
      </Box>
    </AdminLayout>
  );
};
```

## Example 2: Declaration Form Page

### Before (Mock Data)
```tsx
const companies = [
  'Access Bank',
  'Agusto',
  // ... hardcoded list
];

const DeclarationForm = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    console.log('Form submitted', answers);
  };
};
```

### After (API Integration)
```tsx
import {
  useGetDeclarationCompaniesQuery,
  useGetCurrentDeclarationQuery,
  useSubmitDeclarationMutation,
} from '@/lib/redux/services/declaration.service';

const DeclarationForm = () => {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch companies list from API
  const { data: companiesData, isLoading: loadingCompanies } = useGetDeclarationCompaniesQuery();
  const companies = companiesData?.data || [];

  // Check if user already submitted for this year
  const { data: currentDeclaration } = useGetCurrentDeclarationQuery({
    year: selectedYear
  });

  // Submit declaration mutation
  const [submitDeclaration, { isLoading: isSubmitting }] = useSubmitDeclarationMutation();

  // Redirect if already submitted
  useEffect(() => {
    if (currentDeclaration?.data) {
      router.push('/dashboard');
    }
  }, [currentDeclaration, router]);

  const handleSubmit = async () => {
    try {
      const result = await submitDeclaration({
        employeeId: userInfo._id, // from Redux auth state
        year: selectedYear,
        answers,
        policyAgreed: true,
      }).unwrap();

      // Show success modal
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Failed to submit declaration:', err);
      // Show error toast
    }
  };

  if (loadingCompanies) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout>
      {/* Render companies from API */}
      {companies.map((company, index) => (
        <CompanyQuestion
          key={index}
          company={company}
          value={answers[index]}
          onChange={(value) => handleAnswerChange(index, value)}
        />
      ))}

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || Object.keys(answers).length < companies.length}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </DashboardLayout>
  );
};
```

## Example 3: Counterparties Page

### Before (Mock Data)
```tsx
const mockCounterparties = Array.from({ length: 512 }, ...);

const CounterpartiesPage = () => {
  const [selectedCounterparty, setSelectedCounterparty] = useState(null);

  const handleCheckConflict = () => {
    console.log('Checking conflict for:', selectedCounterparty);
  };
};
```

### After (API Integration)
```tsx
import {
  useGetCounterpartiesQuery,
  useCheckConflictMutation,
} from '@/lib/redux/services/counterparty.service';

const CounterpartiesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedConflict, setSelectedConflict] = useState('');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedCounterparty, setSelectedCounterparty] = useState(null);
  const [conflictResult, setConflictResult] = useState(null);

  // Fetch counterparties with filters
  const { data, isLoading } = useGetCounterpartiesQuery({
    filters: {
      sector: selectedSector,
      hasConflict: selectedConflict === 'has' ? true :
                   selectedConflict === 'none' ? false : undefined,
      searchTerm: searchQuery,
      year: selectedYear,
    },
    page: currentPage,
    limit: itemsPerPage,
  });

  // Check conflict mutation
  const [checkConflict, { isLoading: isChecking }] = useCheckConflictMutation();

  const handleCheckConflict = async (counterparty) => {
    try {
      const result = await checkConflict({
        counterpartyId: counterparty._id,
        year: selectedYear,
      }).unwrap();

      setConflictResult(result.data);
      setShowStatement(true);
    } catch (err) {
      console.error('Failed to check conflict:', err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const counterparties = data?.data || [];
  const total = data?.total || 0;

  return (
    <AdminLayout>
      <Box>
        {counterparties.map((counterparty) => (
          <CounterpartyRow
            key={counterparty._id}
            counterparty={counterparty}
            onCheckConflict={() => handleCheckConflict(counterparty)}
            isChecking={isChecking}
          />
        ))}
      </Box>

      {/* Conflict Statement Modal */}
      {conflictResult && (
        <ConflictStatementModal
          counterpartyName={conflictResult.counterpartyName}
          hasConflict={conflictResult.hasConflict}
          employees={conflictResult.conflictedEmployees}
          checkedBy={conflictResult.checkedBy}
          checkedAt={conflictResult.checkedAt}
        />
      )}
    </AdminLayout>
  );
};
```

## Example 4: Admin Dashboard

### New Implementation with API
```tsx
import { useGetDashboardStatsQuery } from '@/lib/redux/services/admin.service';

const AdminDashboard = () => {
  const [selectedYear, setSelectedYear] = useState(2025);

  const { data, isLoading, error } = useGetDashboardStatsQuery({
    year: selectedYear
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  const stats = data?.data;

  return (
    <AdminLayout>
      <Grid templateColumns="repeat(4, 1fr)" gap={6}>
        <StatCard
          title="Total Employees"
          value={stats?.totalEmployees}
          icon={<FiUsers />}
        />
        <StatCard
          title="Total Declarations"
          value={stats?.totalDeclarations}
          icon={<FiFileText />}
        />
        <StatCard
          title="Compliance Rate"
          value={`${stats?.complianceRate}%`}
          icon={<FiCheckCircle />}
        />
        <StatCard
          title="Conflicted Counterparties"
          value={stats?.conflictedCounterparties}
          icon={<FiAlertTriangle />}
        />
      </Grid>

      {/* Recent Activity */}
      <Box mt={8}>
        <Heading size="md" mb={4}>Recent Activity</Heading>
        <VStack align="stretch">
          {stats?.recentActivity.map((activity) => (
            <ActivityItem key={activity._id} activity={activity} />
          ))}
        </VStack>
      </Box>
    </AdminLayout>
  );
};
```

## Loading and Error Components

### Loading Spinner
```tsx
// components/LoadingSpinner.tsx
export const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" h="400px">
    <Spinner size="xl" color="blue.500" />
  </Box>
);
```

### Error Message
```tsx
// components/ErrorMessage.tsx
export const ErrorMessage = ({ error }: { error: any }) => (
  <Box p={6} bg="red.50" borderRadius="md">
    <Text color="red.600" fontWeight="bold">Error</Text>
    <Text color="red.500" mt={2}>
      {error?.data?.message || 'An error occurred while fetching data'}
    </Text>
  </Box>
);
```

## Common Patterns

### 1. Pagination
```tsx
const [page, setPage] = useState(1);
const { data } = useGetEmployeesQuery({ page, limit: 10 });

const handleNextPage = () => setPage((prev) => prev + 1);
const handlePrevPage = () => setPage((prev) => Math.max(1, prev - 1));
```

### 2. Debounced Search
```tsx
import { useDebounce } from '@/hooks/useDebounce';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

const { data } = useGetEmployeesQuery({
  filters: { searchTerm: debouncedSearch }
});
```

### 3. Refetch on Focus
```tsx
const { data, refetch } = useGetEmployeesQuery({ ... });

useEffect(() => {
  const handleFocus = () => refetch();
  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, [refetch]);
```

### 4. Optimistic Updates
```tsx
const [updateEmployee] = useUpdateEmployeeMutation();

const handleUpdate = async (id: string, data: any) => {
  // Optimistically update UI
  dispatch(employeeApi.util.updateQueryData('getEmployees', {}, (draft) => {
    const employee = draft.data.find(e => e._id === id);
    if (employee) Object.assign(employee, data);
  }));

  try {
    await updateEmployee({ id, data }).unwrap();
  } catch {
    // Revert on error
    dispatch(employeeApi.util.invalidateTags(['Employees']));
  }
};
```

## Migration Checklist

- [ ] Replace mock employee data with `useGetEmployeesQuery`
- [ ] Replace mock declaration data with `useGetDeclarationsQuery`
- [ ] Replace mock counterparty data with `useGetCounterpartiesQuery`
- [ ] Implement declaration form submission with `useSubmitDeclarationMutation`
- [ ] Implement conflict checking with `useCheckConflictMutation`
- [ ] Add loading states for all API calls
- [ ] Add error handling for all API calls
- [ ] Implement file download functionality for reports
- [ ] Update admin dashboard with `useGetDashboardStatsQuery`
- [ ] Test all CRUD operations
- [ ] Add toast notifications for success/error states
- [ ] Implement proper error boundaries

## Testing

```tsx
// Example test
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useGetEmployeesQuery } from '@/lib/redux/services/employee.service';

test('fetches employees', async () => {
  const { result } = renderHook(() => useGetEmployeesQuery({}), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toBeDefined();
});
```

## Next Steps

1. Start with one page at a time
2. Test each integration thoroughly
3. Add proper error handling and loading states
4. Update TypeScript types as needed
5. Add user feedback (toasts, modals, etc.)
6. Implement retry logic for failed requests
7. Add offline support with Redux Persist
