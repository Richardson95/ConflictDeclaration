'use client';

import React, { useState, useMemo } from 'react';
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

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Mock data for employees
const baseEmployees = [
  { fullName: 'Adebayo Johnson', department: 'Finance', status: 'Completed' as const, completedDate: 'January 30, 2025' },
  { fullName: 'Funmi Olukar', department: 'Investment', status: 'Pending' as const, completedDate: undefined },
  { fullName: 'Ibrahim Sulaiman', department: 'Compliance', status: 'Completed' as const, completedDate: 'January 30, 2025' },
  { fullName: 'Choma Eze', department: 'Finance', status: 'Pending' as const, completedDate: undefined },
  { fullName: 'Olumide Adeyemi', department: 'Investment', status: 'Completed' as const, completedDate: 'January 30, 2025' },
  { fullName: 'Adebayo Johnson', department: 'Finance', status: 'Completed' as const, completedDate: 'January 30, 2025' },
  { fullName: 'Funmi Olukar', department: 'Investment', status: 'Pending' as const, completedDate: undefined },
  { fullName: 'Ibrahim Sulaiman', department: 'Compliance', status: 'Completed' as const, completedDate: 'January 30, 2025' },
  { fullName: 'Choma Eze', department: 'Finance', status: 'Pending' as const, completedDate: undefined },
];

const mockEmployees: IEmployee[] = Array.from({ length: 512 }, (_, i) => ({
  _id: (i + 1).toString(),
  fullName: baseEmployees[i % baseEmployees.length].fullName,
  department: baseEmployees[i % baseEmployees.length].department,
  status: baseEmployees[i % baseEmployees.length].status,
  completedDate: baseEmployees[i % baseEmployees.length].completedDate,
}));

const EmployeesPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Year selector
  const currentYear = 2025;
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear];

  // Filter options
  const statusOptions = [
    { label: 'Completed', value: 'Completed' },
    { label: 'Pending', value: 'Pending' },
  ];

  const departmentOptions = [
    ...Array.from(new Set(mockEmployees.map((item) => item.department))).map(
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

  // Filter data
  const filteredData = useMemo(() => {
    return mockEmployees.filter((item) => {
      const matchesSearch = item.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      const matchesDepartment = !selectedDepartment || item.department === selectedDepartment;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [searchQuery, selectedStatus, selectedDepartment]);

  // Calculate statistics for chart
  const statusStats = useMemo(() => {
    const completed = filteredData.filter((e) => e.status === 'Completed').length;
    const pending = filteredData.filter((e) => e.status === 'Pending').length;
    return { completed, pending };
  }, [filteredData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
        backgroundColor: ['#47B65C', '#D1D5DB'],
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

  const handleDownloadReport = () => {
    console.log('Downloading report for year:', selectedYear);
    // Implement download logic here
  };

  return (
    <AdminLayout>
      <Box px={{ base: 4, md: 6 }} py={6}>
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
            >
              <LuDownload size={16} />
              Download Report
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
                      onClick={() => setSelectedYear(year)}
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
                  <ChakraSelect.ValueText placeholder="Status" />
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
                  <ChakraSelect.ValueText placeholder="Department" />
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
          </HStack>

          {/* Table */}
          <Box overflowX="auto">
            {/* Table Header */}
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

            {/* Table Body - Desktop */}
            <VStack gap={2} display={{ base: 'none', md: 'flex' }}>
              {paginatedData.map((item, index) => (
                <Box
                  key={item._id}
                  bg={index % 2 === 0 ? 'white' : '#F9FAFB'}
                  borderRadius="8px"
                  px={4}
                  py={3}
                  w="100%"
                  _hover={{ bg: '#F5F7FA' }}
                  transition="background 0.2s"
                  cursor={item.status === 'Completed' ? 'pointer' : 'default'}
                  onClick={item.status === 'Completed' ? () => router.push(`/admin/employees/${item._id}/declarations`) : undefined}
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
                        bg={item.status === 'Completed' ? '#E8F5E9' : '#F5F5F5'}
                        color={item.status === 'Completed' ? '#47B65C' : '#666'}
                        fontSize="12px"
                        fontWeight="500"
                        px={3}
                        py={1}
                        borderRadius="4px"
                      >
                        {item.status}
                      </Box>
                    </Box>
                    <Box w="180px" textAlign="center">
                      <Text fontSize="13px" color="#333">
                        {item.completedDate || '-'}
                      </Text>
                    </Box>
                    <Box w="100px" display="flex" justifyContent="center">
                      {item.status === 'Pending' && (
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
                          cursor="pointer"
                          _hover={{ bg: '#F9FAFB', borderColor: '#47B65C' }}
                          transition="all 0.2s"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle notification
                          }}
                        >
                          <FiBell size={20} color="#47B65C" />
                        </Box>
                      )}
                    </Box>
                  </HStack>
                </Box>
              ))}
            </VStack>

            {/* Table Body - Mobile Cards */}
            <VStack gap={3} display={{ base: 'flex', md: 'none' }}>
              {paginatedData.map((item, index) => (
                <Box
                  key={item._id}
                  bg="white"
                  borderRadius="8px"
                  p={4}
                  w="100%"
                  boxShadow="sm"
                  cursor={item.status === 'Completed' ? 'pointer' : 'default'}
                  onClick={item.status === 'Completed' ? () => router.push(`/admin/employees/${item._id}/declarations`) : undefined}
                  _hover={item.status === 'Completed' ? { boxShadow: 'md' } : {}}
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
                        bg={item.status === 'Completed' ? '#E8F5E9' : '#F5F5F5'}
                        color={item.status === 'Completed' ? '#47B65C' : '#666'}
                        fontSize="12px"
                        fontWeight="500"
                        px={3}
                        py={1}
                        borderRadius="4px"
                      >
                        {item.status}
                      </Box>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="12px" fontWeight="600" color="#666">
                        Completed Date:
                      </Text>
                      <Text fontSize="13px" color="#333">
                        {item.completedDate || '-'}
                      </Text>
                    </HStack>
                    {item.status === 'Pending' && (
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
                          cursor="pointer"
                          _hover={{ bg: '#F9FAFB', borderColor: '#47B65C' }}
                          transition="all 0.2s"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle notification
                          }}
                        >
                          <FiBell size={20} color="#47B65C" />
                        </Box>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Pagination */}
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
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default EmployeesPage;
