import { Suspense } from 'react';
import DeclarationCertificate from '@/lib/pages/declaration/certificate';
import { Box, Spinner } from '@chakra-ui/react';

function CertificatePage() {
  return (
    <Suspense
      fallback={
        <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
          <Spinner size="xl" color="#227CBF" />
        </Box>
      }
    >
      <DeclarationCertificate />
    </Suspense>
  );
}

export default CertificatePage;
