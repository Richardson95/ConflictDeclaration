import { Suspense } from 'react';
import DeclarationView from '@/lib/pages/declaration/view';
import { Box, Spinner } from '@chakra-ui/react';

function ViewPage() {
  return (
    <Suspense
      fallback={
        <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
          <Spinner size="xl" color="#227CBF" />
        </Box>
      }
    >
      <DeclarationView />
    </Suspense>
  );
}

export default ViewPage;
