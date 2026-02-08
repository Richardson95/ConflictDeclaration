'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Select as ChakraSelect,
  createListCollection,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Button as ChakraButton,
} from '@chakra-ui/react';
import { Button } from '@/components/ui';
import AdminLayout from '@/lib/layout/AdminLayout';
import { FiChevronDown, FiBell } from 'react-icons/fi';
import { LuDownload } from 'react-icons/lu';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { IEmployee } from '@/lib/interfaces/employee.interfaces';
import { useNotifyUserMutation, useGetAllUsersDeclarationStatusQuery } from '@/lib/redux/services/dashboard.service';
import { toaster } from '@/components/ui/toaster';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { useGetCurrentUserQuery } from '@/lib/redux/services/auth.service';
import { isOperations } from '@/lib/constants/roles';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const EmployeesPage = () => {
  const router = useRouter();

  // Redirect Operations users to dashboard
  const { data: currentUserData } = useGetCurrentUserQuery();
  const currentUser = currentUserData?.data;
  useEffect(() => {
    if (currentUser && isOperations(currentUser.role)) {
      router.push('/admin');
    }
  }, [currentUser, router]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Year selector - computed client-side to avoid hydration mismatch
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const yearOptions = useMemo(() => [currentYear - 2, currentYear - 1, currentYear], [currentYear]);

  // Set actual year on client mount to avoid SSR hydration issues
  useEffect(() => {
    const year = new Date().getFullYear();
    setCurrentYear(year);
    setSelectedYear(year);
  }, []);

  // Reset to page 1 when year changes
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedDepartment('');
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedStatus || selectedDepartment;

  // Notify user mutation - track which user is being notified to prevent duplicate clicks
  const [notifyUser] = useNotifyUserMutation();
  const [notifyingUserId, setNotifyingUserId] = useState<string | null>(null);

  // Download state
  const [isDownloading, setIsDownloading] = React.useState(false);

  // Fetch users declaration status from API
  const { data: usersData, isLoading: isLoadingUsers } = useGetAllUsersDeclarationStatusQuery({
    page: currentPage,
    limit: itemsPerPage,
    year: selectedYear,
  });

  const employees = usersData?.data?.result || [];
  const totalRecords = usersData?.data?.totalRecords || 0;
  const totalPages = usersData?.data?.totalPages || 1;

  // Format date helper
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      return '-';
    }
  };

  // Handle sending notification to user
  const handleNotifyUser = async (userId: string, fullName: string) => {
    // Prevent duplicate clicks while request is in progress
    if (notifyingUserId) return;

    setNotifyingUserId(userId);
    try {
      const result = await notifyUser({ userId }).unwrap();

      // Check if the response indicates actual success
      if (result.success === false || result.message?.includes('error') || result.message?.includes('failed')) {
        toaster.error({
          title: 'Message Failed to Send',
          description: `Unable to send reminder to ${fullName}. Please try again later or contact support.`,
        });
        return;
      }

      toaster.success({
        title: 'Notification Sent',
        description: `Reminder sent to ${fullName} successfully.`,
      });
    } catch (error: any) {
      toaster.error({
        title: 'Message Failed to Send',
        description: `Unable to send reminder to ${fullName}. Please try again later or contact support.`,
      });
    } finally {
      setNotifyingUserId(null);
    }
  };

  // Filter options
  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Pending', value: 'Pending' },
  ];

  const departmentOptions = [
    { label: 'All Departments', value: '' },
    ...Array.from(new Set(employees.map((item: any) => item.department))).map(
      (dept) => ({
        label: dept,
        value: dept,
      })
    ),
  ];

  const statusCollection = createListCollection({
    items: statusOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const departmentCollection = createListCollection({
    items: departmentOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const itemsPerPageOptions = [10, 20, 50, 100].map((num) => ({
    label: num.toString(),
    value: num.toString(),
  }));

  const itemsPerPageCollection = createListCollection({
    items: itemsPerPageOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  // Filter data (client-side filtering on current page data)
  const filteredData = useMemo(() => {
    return employees.filter((item: any) => {
      const matchesSearch = item.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !selectedStatus || item.statusOfDeclaration === selectedStatus;
      const matchesDepartment = !selectedDepartment || item.department === selectedDepartment;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employees, searchQuery, selectedStatus, selectedDepartment]);

  // Calculate statistics for chart
  const statusStats = useMemo(() => {
    const completed = filteredData.filter((e: any) => e.statusOfDeclaration === 'Completed').length;
    const pending = filteredData.filter((e: any) => e.statusOfDeclaration === 'Pending').length;
    return { completed, pending };
  }, [filteredData]);

  // Use filtered data for display (already paginated from API)
  const paginatedData = filteredData;
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Generate page numbers
  const renderPageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  // Chart data
  const chartData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [statusStats.completed, statusStats.pending],
        backgroundColor: ['#47B65C', '#FF8A65'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      // Get the main content area (excluding sidebar)
      const contentElement = document.getElementById('pdf-content');

      if (!contentElement) {
        throw new Error('Content element not found');
      }

      // Wait for charts and all content to fully render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate PNG from the content using html-to-image (better CSS support)
      const dataUrl = await toPng(contentElement, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      // Create an image to get dimensions
      const img = new Image();
      img.src = dataUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (img.height * imgWidth) / img.width;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Add image to PDF (handle multiple pages if content is long)
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      pdf.save(`employee-declaration-status-${selectedYear}.pdf`);

      toaster.success({
        title: 'Report Downloaded',
        description: `Employee declaration status report downloaded successfully.`,
      });
    } catch (error: any) {
      console.error('PDF Generation Error:', error);
      toaster.error({
        title: 'Download Failed',
        description: 'Unable to download report. Please try again later.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AdminLayout hideBackButton={true}>
      <Box id="pdf-content" px={{ base: 4, md: 6 }} py={6}>
        {/* Header */}
        <HStack justify="space-between" mb={6}>
          <Text fontSize="24px" fontWeight="600" color="#2C3E50">
            Employees
          </Text>

          <HStack gap={2}>
            {/* Download Report Button */}
            <Button
              bg="#47B65C"
              color="white"
              fontSize="14px"
              fontWeight="500"
              px={4}
              h="40px"
              borderRadius="6px"
              _hover={{ bg: '#3DA550' }}
              onClick={handleDownloadReport}
              display="flex"
              alignItems="center"
              gap={2}
              disabled={isDownloading}
            >
              <LuDownload size={16} />
              {isDownloading ? 'Generating PDF...' : 'Download Report'}
            </Button>

            {/* Year Selector */}
            <Box position="relative">
              <MenuRoot>
                <MenuTrigger asChild>
                  <HStack
                    cursor="pointer"
                    _hover={{ bg: 'gray.50' }}
                    px={4}
                    py={2}
                    borderRadius="6px"
                    transition="all 0.2s"
                    bg="white"
                    border="1px solid #E6E7EC"
                    gap={2}
                    height="40px"
                  >
                    <Text fontSize="14px" fontWeight="500" color="#333">
                      {selectedYear}
                    </Text>
                    <FiChevronDown color="#666" />
                  </HStack>
                </MenuTrigger>

                <MenuContent
                  minW="120px"
                  p={1}
                  borderRadius="8px"
                  boxShadow="lg"
                  bg="white"
                  position="absolute"
                  top="100%"
                  right="0"
                  mt={1}
                  zIndex={1000}
                >
                  {yearOptions.map((year) => (
                    <MenuItem
                      key={year}
                      value={year.toString()}
                      fontSize="14px"
                      py={2}
                      px={3}
                      bg={selectedYear === year ? 'gray.100' : 'white'}
                      _hover={{ bg: 'gray.50' }}
                      cursor="pointer"
                      onClick={() => handleYearChange(year)}
                      borderRadius="4px"
                    >
                      {year}
                    </MenuItem>
                  ))}
                </MenuContent>
              </MenuRoot>
            </Box>
          </HStack>
        </HStack>

        {/* Status Chart Section */}
        <Box bg="white" borderRadius="12px" p={6} mb={6}>
          <Text fontSize="16px" fontWeight="600" color="#333" mb={4}>
            Status
          </Text>
          <Box maxW="300px" mx="auto">
            <Doughnut data={chartData} options={chartOptions} />
          </Box>
        </Box>

        {/* Table Section */}
        <Box bg="white" borderRadius="12px" p={6}>
          {/* Filters */}
          <HStack
            gap={3}
            mb={6}
            flexWrap="wrap"
            align="center"
          >
            {/* Status Filter */}
            <Box minW="140px" maxW="180px">
              <ChakraSelect.Root
                collection={statusCollection}
                size="sm"
                value={[selectedStatus]}
                onValueChange={(e) => setSelectedStatus(e.value[0])}
              >
                <ChakraSelect.Trigger
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  borderRadius="6px"
                  height="40px"
                >
                  <ChakraSelect.ValueText placeholder="All Status" />
                  <ChakraSelect.Indicator />
                </ChakraSelect.Trigger>
                <ChakraSelect.Content
                  bg="white"
                  borderRadius="8px"
                  boxShadow="lg"
                  zIndex={1500}
                  position="absolute"
                >
                  {statusOptions.map((option) => (
                    <ChakraSelect.Item key={option.value} item={option}>
                      {option.label}
                    </ChakraSelect.Item>
                  ))}
                </ChakraSelect.Content>
              </ChakraSelect.Root>
            </Box>

            {/* Department Filter */}
            <Box minW="140px" maxW="180px">
              <ChakraSelect.Root
                collection={departmentCollection}
                size="sm"
                value={[selectedDepartment]}
                onValueChange={(e) => setSelectedDepartment(e.value[0])}
              >
                <ChakraSelect.Trigger
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  borderRadius="6px"
                  height="40px"
                >
                  <ChakraSelect.ValueText placeholder="All Departments" />
                  <ChakraSelect.Indicator />
                </ChakraSelect.Trigger>
                <ChakraSelect.Content
                  bg="white"
                  borderRadius="8px"
                  boxShadow="lg"
                  zIndex={1500}
                  position="absolute"
                >
                  {departmentOptions.map((option) => (
                    <ChakraSelect.Item key={option.value} item={option}>
                      {option.label}
                    </ChakraSelect.Item>
                  ))}
                </ChakraSelect.Content>
              </ChakraSelect.Root>
            </Box>

            {/* Search */}
            <Box minW="200px" flex="1" maxW="400px">
              <Input
                placeholder="Search by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="sm"
                bg="white"
                borderColor="#D1D5DB"
                _hover={{ borderColor: '#9CA3AF' }}
                _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                borderRadius="6px"
                height="40px"
              />
            </Box>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <ChakraButton
                bg="white"
                color="#666"
                fontSize="13px"
                fontWeight="500"
                px={4}
                h="40px"
                borderRadius="6px"
                border="1px solid #D1D5DB"
                _hover={{ bg: '#F9FAFB', borderColor: '#9CA3AF' }}
                onClick={handleClearFilters}
              >
                Clear Filters
              </ChakraButton>
            )}
          </HStack>

          {/* Table */}
          <Box overflowX="auto">
            {/* Loading State */}
            {isLoadingUsers && (
              <Box py={12} textAlign="center">
                <Text fontSize="14px" color="#666">
                  Loading employee data...
                </Text>
              </Box>
            )}

            {/* Empty State */}
            {!isLoadingUsers && paginatedData.length === 0 && (
              <VStack py={12} gap={3}>
                <Text fontSize="16px" fontWeight="600" color="#333">
                  No Records Found
                </Text>
                <Text fontSize="14px" color="#666" textAlign="center" maxW="400px">
                  {searchQuery || selectedStatus || selectedDepartment
                    ? 'No employees match your current filters. Try adjusting your search criteria.'
                    : `No declaration records found for ${selectedYear}. Employees may not have submitted declarations for this year yet.`}
                </Text>
              </VStack>
            )}

            {/* Table Header */}
            {!isLoadingUsers && paginatedData.length > 0 && (
              <Box
                bg="#E2EEFE"
                borderRadius="8px"
                px={4}
                py={3}
                mb={2}
                display={{ base: 'none', md: 'block' }}
              >
                <HStack>
                  <Box w="60px">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      S/N
                    </Text>
                  </Box>
                  <Box flex="1">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Full Name
                    </Text>
                  </Box>
                  <Box flex="1">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Department
                    </Text>
                  </Box>
                  <Box w="150px" textAlign="center">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Status
                    </Text>
                  </Box>
                  <Box w="180px" textAlign="center">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Completed Date
                    </Text>
                  </Box>
                  <Box w="100px" textAlign="center">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Actions
                    </Text>
                  </Box>
                </HStack>
              </Box>
            )}

            {/* Table Body - Desktop */}
            {!isLoadingUsers && paginatedData.length > 0 && (
              <VStack gap={2} display={{ base: 'none', md: 'flex' }}>
                {paginatedData.map((item, index) => (
                <Box
                  key={item.id}
                  bg={index % 2 === 0 ? 'white' : '#F9FAFB'}
                  borderRadius="8px"
                  px={4}
                  py={3}
                  w="100%"
                  _hover={{ bg: '#F5F7FA' }}
                  transition="background 0.2s"
                  cursor={item.statusOfDeclaration === 'Completed' ? 'pointer' : 'default'}
                  onClick={item.statusOfDeclaration === 'Completed' ? () => router.push(`/admin/employees/${item.id}/declarations`) : undefined}
                >
                  <HStack>
                    <Box w="60px">
                      <Text fontSize="13px" color="#333">
                        {startIndex + index + 1}
                      </Text>
                    </Box>
                    <Box flex="1">
                      <Text fontSize="13px" color="#333">
                        {item.fullName}
                      </Text>
                    </Box>
                    <Box flex="1">
                      <Text fontSize="13px" color="#333">
                        {item.department}
                      </Text>
                    </Box>
                    <Box w="150px" textAlign="center">
                      <Box
                        display="inline-block"
                        bg={item.statusOfDeclaration === 'Completed' ? '#E8F5E9' : '#FFE8E0'}
                        color={item.statusOfDeclaration === 'Completed' ? '#47B65C' : '#FF8A65'}
                        fontSize="12px"
                        fontWeight="500"
                        px={3}
                        py={1}
                        borderRadius="4px"
                      >
                        {item.statusOfDeclaration}
                      </Box>
                    </Box>
                    <Box w="180px" textAlign="center">
                      <Text fontSize="13px" color="#333">
                        {formatDate(item.completedDate)}
                      </Text>
                    </Box>
                    <Box w="100px" display="flex" justifyContent="center">
                      {item.statusOfDeclaration === 'Pending' && (
                        <Box
                          as="button"
                          w="40px"
                          h="40px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          bg="white"
                          border="1px solid #E5E7EB"
                          borderRadius="8px"
                          cursor={notifyingUserId ? 'not-allowed' : 'pointer'}
                          opacity={notifyingUserId === item.id ? 0.6 : 1}
                          _hover={notifyingUserId ? {} : { bg: '#F9FAFB', borderColor: '#47B65C' }}
                          transition="all 0.2s"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!notifyingUserId) {
                              handleNotifyUser(item.id, item.fullName);
                            }
                          }}
                        >
                          {notifyingUserId === item.id ? (
                            <Box
                              w="16px"
                              h="16px"
                              border="2px solid #47B65C"
                              borderTopColor="transparent"
                              borderRadius="50%"
                              animation="spin 1s linear infinite"
                              css={{ '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }}
                            />
                          ) : (
                            <FiBell size={20} color="#47B65C" />
                          )}
                        </Box>
                      )}
                    </Box>
                  </HStack>
                </Box>
              ))}
              </VStack>
            )}

            {/* Table Body - Mobile Cards */}
            {!isLoadingUsers && paginatedData.length > 0 && (
              <VStack gap={3} display={{ base: 'flex', md: 'none' }}>
                {paginatedData.map((item, index) => (
                <Box
                  key={item.id}
                  bg="white"
                  borderRadius="8px"
                  p={4}
                  w="100%"
                  boxShadow="sm"
                  cursor={item.statusOfDeclaration === 'Completed' ? 'pointer' : 'default'}
                  onClick={item.statusOfDeclaration === 'Completed' ? () => router.push(`/admin/employees/${item.id}/declarations`) : undefined}
                  _hover={item.statusOfDeclaration === 'Completed' ? { boxShadow: 'md' } : {}}
                  transition="box-shadow 0.2s"
                >
                  <VStack align="stretch" gap={2}>
                    <HStack justify="space-between">
                      <Text fontSize="12px" fontWeight="600" color="#666">
                        S/N:
                      </Text>
                      <Text fontSize="13px" color="#333">
                        {startIndex + index + 1}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="12px" fontWeight="600" color="#666">
                        Full Name:
                      </Text>
                      <Text fontSize="13px" color="#333">
                        {item.fullName}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="12px" fontWeight="600" color="#666">
                        Department:
                      </Text>
                      <Text fontSize="13px" color="#333">
                        {item.department}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="12px" fontWeight="600" color="#666">
                        Status:
                      </Text>
                      <Box
                        display="inline-block"
                        bg={item.statusOfDeclaration === 'Completed' ? '#E8F5E9' : '#FFE8E0'}
                        color={item.statusOfDeclaration === 'Completed' ? '#47B65C' : '#FF8A65'}
                        fontSize="12px"
                        fontWeight="500"
                        px={3}
                        py={1}
                        borderRadius="4px"
                      >
                        {item.statusOfDeclaration}
                      </Box>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="12px" fontWeight="600" color="#666">
                        Completed Date:
                      </Text>
                      <Text fontSize="13px" color="#333">
                        {formatDate(item.completedDate)}
                      </Text>
                    </HStack>
                    {item.statusOfDeclaration === 'Pending' && (
                      <HStack justify="flex-end" mt={2}>
                        <Box
                          as="button"
                          w="40px"
                          h="40px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          bg="white"
                          border="1px solid #E5E7EB"
                          borderRadius="8px"
                          cursor={notifyingUserId ? 'not-allowed' : 'pointer'}
                          opacity={notifyingUserId === item.id ? 0.6 : 1}
                          _hover={notifyingUserId ? {} : { bg: '#F9FAFB', borderColor: '#47B65C' }}
                          transition="all 0.2s"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!notifyingUserId) {
                              handleNotifyUser(item.id, item.fullName);
                            }
                          }}
                        >
                          {notifyingUserId === item.id ? (
                            <Box
                              w="16px"
                              h="16px"
                              border="2px solid #47B65C"
                              borderTopColor="transparent"
                              borderRadius="50%"
                              animation="spin 1s linear infinite"
                              css={{ '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }}
                            />
                          ) : (
                            <FiBell size={20} color="#47B65C" />
                          )}
                        </Box>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              ))}
              </VStack>
            )}
          </Box>

          {/* Pagination */}
          {!isLoadingUsers && paginatedData.length > 0 && (
            <HStack justify="space-between" mt={6} flexWrap="wrap" gap={4}>
            {/* Items per page */}
            <HStack gap={2}>
              <Text fontSize="13px" color="#666">
                Showing
              </Text>
              <ChakraSelect.Root
                collection={itemsPerPageCollection}
                size="sm"
                value={[itemsPerPage.toString()]}
                onValueChange={(e) => {
                  setItemsPerPage(Number(e.value[0]));
                  setCurrentPage(1);
                }}
                width="80px"
              >
                <ChakraSelect.Trigger
                  bg="white"
                  borderColor="#E6E7EC"
                  borderRadius="6px"
                >
                  <ChakraSelect.ValueText />
                </ChakraSelect.Trigger>
                <ChakraSelect.Content bg="white" borderRadius="8px">
                  {itemsPerPageOptions.map((option) => (
                    <ChakraSelect.Item key={option.value} item={option}>
                      {option.label}
                    </ChakraSelect.Item>
                  ))}
                </ChakraSelect.Content>
              </ChakraSelect.Root>
              <Text fontSize="13px" color="#666">
                out of {filteredData.length}
              </Text>
            </HStack>

            {/* Page numbers */}
            <HStack gap={1}>
              {/* Previous button */}
              <Box
                as="button"
                w="32px"
                h="32px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="6px"
                bg="white"
                border="1px solid #E6E7EC"
                cursor={currentPage === 1 ? 'not-allowed' : 'pointer'}
                opacity={currentPage === 1 ? 0.5 : 1}
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                _hover={{
                  bg: currentPage === 1 ? 'white' : '#F5F5F5',
                }}
              >
                <Text fontSize="18px">&lt;</Text>
              </Box>

              {/* Page numbers */}
              {renderPageNumbers.map((page, index) => (
                <Box
                  key={index}
                  as="button"
                  minW="32px"
                  h="32px"
                  px={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="6px"
                  bg={page === currentPage ? '#227CBF' : 'white'}
                  color={page === currentPage ? 'white' : '#333'}
                  border="1px solid"
                  borderColor={page === currentPage ? '#227CBF' : '#E6E7EC'}
                  cursor={page === '...' ? 'default' : 'pointer'}
                  fontSize="13px"
                  fontWeight={page === currentPage ? '600' : '400'}
                  onClick={() =>
                    typeof page === 'number' && setCurrentPage(page)
                  }
                  _hover={{
                    bg: page === '...' ? 'white' : page === currentPage ? '#227CBF' : '#F5F5F5',
                  }}
                >
                  {page}
                </Box>
              ))}

              {/* Next button */}
              <Box
                as="button"
                w="32px"
                h="32px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="6px"
                bg="white"
                border="1px solid #E6E7EC"
                cursor={currentPage === totalPages ? 'not-allowed' : 'pointer'}
                opacity={currentPage === totalPages ? 0.5 : 1}
                onClick={() =>
                  currentPage < totalPages && setCurrentPage(currentPage + 1)
                }
                _hover={{
                  bg: currentPage === totalPages ? 'white' : '#F5F5F5',
                }}
              >
                <Text fontSize="18px">&gt;</Text>
              </Box>
            </HStack>
            </HStack>
          )}
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default EmployeesPage;
