'use client';

import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Stack,
  Text,
  Separator,
  Card,
} from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Button,
  ButtonGroup,
  Dialog,
  FormikInput,
  FormikPasswordInput,
  FormikTextarea,
  FormikSelect,
  FormikCheckbox,
  FormikRadio,
  FormikSwitch,
  toaster,
} from '@/components/ui';
import {
  RiMailLine,
  RiArrowRightLine,
  RiSaveLine,
  RiDeleteBinLine,
  RiEditLine,
  RiUserLine,
  RiDownloadLine,
  RiUploadLine,
  RiSearchLine,
  RiHeartLine,
  RiStarLine,
  RiExternalLinkLine,
} from 'react-icons/ri';
import { useState } from 'react';

// Validation schema for the demo form
const demoSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  bio: Yup.string().max(500, 'Bio must be less than 500 characters'),
  country: Yup.string().required('Please select a country'),
  skills: Yup.array().min(1, 'Please select at least one skill'),
  newsletter: Yup.boolean(),
  theme: Yup.string().required('Please select a theme'),
  notifications: Yup.boolean(),
});

export const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Sample options for select components
  const countryOptions = [
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' },
    { label: 'United Kingdom', value: 'uk' },
    { label: 'Germany', value: 'de' },
    { label: 'France', value: 'fr' },
    { label: 'Japan', value: 'jp' },
  ];

  const skillOptions = [
    { label: 'JavaScript', value: 'js', category: 'Languages' },
    { label: 'TypeScript', value: 'ts', category: 'Languages' },
    { label: 'Python', value: 'python', category: 'Languages' },
    { label: 'React', value: 'react', category: 'Frameworks' },
    { label: 'Vue.js', value: 'vue', category: 'Frameworks' },
    { label: 'Angular', value: 'angular', category: 'Frameworks' },
    { label: 'Node.js', value: 'node', category: 'Runtime' },
    { label: 'Deno', value: 'deno', category: 'Runtime' },
  ];

  const themeOptions = [
    { label: 'Light Mode', value: 'light' },
    { label: 'Dark Mode', value: 'dark' },
    { label: 'System Auto', value: 'auto' },
  ];

  const handleFormSubmit = async (values: any) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Form submitted:', values);

      // Show success toast
      toaster.success({
        title: 'Form Submitted!',
        description: 'Your form has been submitted successfully.',
        closable: true,
      });

      setShowAlert(true);
    } catch (error) {
      // Show error toast
      toaster.error({
        title: 'Submission Failed',
        description:
          'There was an error submitting your form. Please try again.',
        closable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateProcess = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsProcessing(false);
  };

  return (
    <Container maxW="6xl" py={8}>
      <VStack gap={12} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="4xl" mb={4} color="brand.100">
            Chakra Components Infracredit
          </Heading>
          <Text fontSize="xl" color="fg.muted">
            A comprehensive showcase of enhanced Chakra UI components with
            Formik integration
          </Text>
        </Box>

        {/* Enhanced Button Examples */}
        <Card.Root>
          <Card.Header>
            <Heading size="2xl">Enhanced Button Components</Heading>
            <Text color="fg.muted">
              Buttons with icons, loading states, and grouping
            </Text>
          </Card.Header>
          <Card.Body>
            <VStack gap={8} align="stretch">
              {/* Basic Buttons with Icons */}
              <Box>
                <Heading size="lg" mb={4}>
                  Icon Buttons
                </Heading>
                <HStack wrap="wrap" gap={4}>
                  <Button
                    leftIcon={<RiMailLine />}
                    colorPalette="teal"
                    variant="solid"
                  >
                    Send Email
                  </Button>
                  <Button rightIcon={<RiArrowRightLine />} variant="outline">
                    Continue
                  </Button>
                  <Button
                    leftIcon={<RiUserLine />}
                    rightIcon={<RiExternalLinkLine />}
                    variant="surface"
                  >
                    View Profile
                  </Button>
                  <Button
                    leftIcon={<RiHeartLine />}
                    colorPalette="red"
                    variant="subtle"
                  >
                    Favorite
                  </Button>
                </HStack>
              </Box>

              {/* Loading States */}
              <Box>
                <Heading size="lg" mb={4}>
                  Loading States
                </Heading>
                <HStack wrap="wrap" gap={4}>
                  <Button
                    loading={isLoading}
                    loadingText="Saving..."
                    leftIcon={<RiSaveLine />}
                    colorPalette="green"
                    onClick={() => {
                      setIsLoading(true);
                      setTimeout(() => setIsLoading(false), 2000);
                    }}
                  >
                    Save Document
                  </Button>
                  <Button
                    loading={isProcessing}
                    loadingText="Processing..."
                    spinnerPlacement="end"
                    rightIcon={<RiUploadLine />}
                    colorPalette="blue"
                    variant="outline"
                    onClick={simulateProcess}
                  >
                    Upload Files
                  </Button>
                  <Button loading variant="ghost">
                    Loading...
                  </Button>
                </HStack>
              </Box>

              {/* Button Groups */}
              <Box>
                <Heading size="lg" mb={4}>
                  Button Groups
                </Heading>
                <VStack gap={4} align="start">
                  <ButtonGroup size="sm" variant="outline">
                    <Button leftIcon={<RiEditLine />} colorPalette="blue">
                      Edit
                    </Button>
                    <Button leftIcon={<RiDeleteBinLine />} colorPalette="red">
                      Delete
                    </Button>
                    <Button leftIcon={<RiDownloadLine />}>Download</Button>
                  </ButtonGroup>

                  <ButtonGroup size="md" variant="solid" attached>
                    <Button colorPalette="purple">Actions</Button>
                    <Button variant="outline">
                      <RiArrowRightLine />
                    </Button>
                  </ButtonGroup>
                </VStack>
              </Box>

              {/* Size and Variant Examples */}
              <Box>
                <Heading size="lg" mb={4}>
                  Sizes & Variants
                </Heading>
                <VStack gap={4} align="start">
                  <HStack wrap="wrap" gap={3}>
                    <Button size="xs" leftIcon={<RiStarLine />}>
                      Extra Small
                    </Button>
                    <Button size="sm" leftIcon={<RiStarLine />}>
                      Small
                    </Button>
                    <Button size="md" leftIcon={<RiStarLine />}>
                      Medium
                    </Button>
                    <Button size="lg" leftIcon={<RiStarLine />}>
                      Large
                    </Button>
                  </HStack>
                  <HStack wrap="wrap" gap={3}>
                    <Button variant="solid" colorPalette="blue">
                      Solid
                    </Button>
                    <Button variant="outline" colorPalette="blue">
                      Outline
                    </Button>
                    <Button variant="surface" colorPalette="blue">
                      Surface
                    </Button>
                    <Button variant="subtle" colorPalette="blue">
                      Subtle
                    </Button>
                    <Button variant="ghost" colorPalette="blue">
                      Ghost
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Separator />

        {/* Feedback Components */}
        <Card.Root>
          <Card.Header>
            <Heading size="2xl">Feedback Components</Heading>
            <Text color="fg.muted">Alert messages and dialog modals</Text>
          </Card.Header>
          <Card.Body>
            <VStack gap={6} align="stretch">
              {/* Alert Examples */}
              <Box>
                <Heading size="lg" mb={4}>
                  Alerts
                </Heading>
                <VStack gap={4} align="stretch">
                  {showAlert && (
                    <Alert
                      status="success"
                      title="Success!"
                      description="Your form has been submitted successfully."
                      onClose={() => setShowAlert(false)}
                      variant="subtle"
                    />
                  )}

                  <Alert
                    status="warning"
                    title="Warning"
                    description="Please review your information before submitting."
                    variant="outline"
                  />

                  <Alert
                    status="error"
                    title="Error"
                    description="There was an error processing your request."
                    variant="solid"
                  />

                  <Alert
                    status="info"
                    title="Information"
                    description="You can close alerts by clicking the X button."
                    showIcon={false}
                    variant="subtle"
                  />
                </VStack>
              </Box>

              {/* Dialog Example */}
              <Box>
                <Heading size="lg" mb={4}>
                  Dialog
                </Heading>
                <Button onClick={() => setDialogOpen(true)} variant="outline">
                  Open Dialog
                </Button>

                <Dialog
                  open={dialogOpen}
                  onOpenChange={(e) => setDialogOpen(e.open)}
                  title="Confirm Action"
                  description="Are you sure you want to perform this action? This cannot be undone."
                  confirmText="Yes, Continue"
                  cancelText="Cancel"
                  size="xl"
                  onConfirm={() => {
                    setDialogOpen(false);
                    // Handle confirm action
                  }}
                  onCancel={() => setDialogOpen(false)}
                />
              </Box>

              {/* Toast Examples */}
              <Box>
                <Heading size="lg" mb={4}>
                  Toast Notifications
                </Heading>
                <VStack gap={4} align="start">
                  {/* Basic Toast Types */}
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Toast Types
                    </Text>
                    <HStack wrap="wrap" gap={3}>
                      <Button
                        size="sm"
                        variant="outline"
                        colorPalette="green"
                        onClick={() =>
                          toaster.create({
                            title: 'Success!',
                            description:
                              'Your action was completed successfully.',
                            type: 'success',
                          })
                        }
                      >
                        Success
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorPalette="red"
                        onClick={() =>
                          toaster.create({
                            title: 'Error occurred',
                            description:
                              'Something went wrong. Please try again.',
                            type: 'error',
                          })
                        }
                      >
                        Error
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorPalette="orange"
                        onClick={() =>
                          toaster.create({
                            title: 'Warning',
                            description:
                              'Please review your input before proceeding.',
                            type: 'warning',
                          })
                        }
                      >
                        Warning
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorPalette="blue"
                        onClick={() =>
                          toaster.create({
                            title: 'Information',
                            description:
                              "Here's some useful information for you.",
                            type: 'info',
                          })
                        }
                      >
                        Info
                      </Button>
                    </HStack>
                  </Box>

                  {/* Advanced Toast Features */}
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Advanced Features
                    </Text>
                    <HStack wrap="wrap" gap={3}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toaster.create({
                            title: 'Closable Toast',
                            description: 'This toast can be manually closed.',
                            type: 'info',
                            closable: true,
                          })
                        }
                      >
                        Closable
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toaster.create({
                            title: 'Long Duration',
                            description: 'This toast will stay for 8 seconds.',
                            type: 'info',
                            duration: 8000,
                          })
                        }
                      >
                        Long Duration
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toaster.create({
                            title: 'Loading...',
                            description: 'This is a persistent loading toast.',
                            type: 'loading',
                          })
                        }
                      >
                        Loading
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toaster.success({
                            title: 'Action Required',
                            description: 'Click the action button to continue.',
                            action: {
                              label: 'Undo',
                              onClick: () => console.log('Action clicked!'),
                            },
                          })
                        }
                      >
                        With Action
                      </Button>
                    </HStack>
                  </Box>

                  {/* Toast Promise Example */}
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Promise Toast
                    </Text>
                    <Button
                      size="sm"
                      variant="outline"
                      colorPalette="purple"
                      onClick={() => {
                        const promise = new Promise<void>((resolve, reject) => {
                          setTimeout(() => {
                            Math.random() > 0.5
                              ? resolve()
                              : reject(new Error('Random failure'));
                          }, 3000);
                        });

                        toaster.promise(promise, {
                          success: {
                            title: 'Upload Complete!',
                            description: 'Your file was uploaded successfully.',
                          },
                          error: {
                            title: 'Upload Failed',
                            description:
                              'There was an error uploading your file.',
                          },
                          loading: {
                            title: 'Uploading...',
                            description:
                              'Please wait while we process your file.',
                          },
                        });
                      }}
                    >
                      Promise Toast
                    </Button>
                  </Box>

                  {/* Toast Controls */}
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Toast Controls
                    </Text>
                    <HStack gap={3}>
                      <Button
                        size="sm"
                        variant="outline"
                        colorPalette="gray"
                        onClick={() => toaster.dismiss()}
                      >
                        Dismiss All
                      </Button>
                    </HStack>
                  </Box>
                </VStack>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Separator />

        {/* Formik Form Components */}
        <Card.Root>
          <Card.Header>
            <Heading size="2xl">Formik Form Components</Heading>
            <Text color="fg.muted">
              Enhanced form inputs with automatic validation and error handling
            </Text>
          </Card.Header>
          <Card.Body>
            <Formik
              initialValues={{
                email: '',
                password: '',
                bio: '',
                country: '',
                skills: [],
                newsletter: false,
                theme: '',
                notifications: true,
              }}
              validationSchema={demoSchema}
              onSubmit={handleFormSubmit}
            >
              {({ isSubmitting, values }) => (
                <Form>
                  <VStack gap={6} align="stretch" maxW="md">
                    {/* FormikInput */}
                    <FormikInput
                      name="email"
                      label="Email Address"
                      placeholder="Enter your email"
                      type="email"
                      isRequired
                      helperText="We'll never share your email address"
                      variant="outline"
                      size="xl"
                    />

                    {/* FormikPasswordInput */}
                    <FormikPasswordInput
                      name="password"
                      label="Password"
                      placeholder="Create a secure password"
                      isRequired
                      helperText="Password must be at least 6 characters"
                      variant="outline"
                      size="md"
                    />

                    {/* FormikTextarea */}
                    <FormikTextarea
                      name="bio"
                      label="Bio"
                      placeholder="Tell us about yourself..."
                      helperText="Maximum 500 characters"
                      variant="outline"
                      size="md"
                      resize="vertical"
                      rows={4}
                    />

                    {/* FormikSelect - Single */}
                    <FormikSelect
                      name="country"
                      label="Country"
                      placeholder="Select your country"
                      options={countryOptions}
                      isRequired
                      helperText="Choose your country of residence"
                      variant="outline"
                      size="md"
                    />

                    {/* FormikSelect - Multiple with Groups */}
                    <FormikSelect
                      name="skills"
                      label="Skills"
                      placeholder="Select your skills"
                      options={skillOptions}
                      multiple={true}
                      isRequired
                      helperText="Select all skills that apply (grouped by category)"
                      variant="outline"
                      size="md"
                    />

                    {/* FormikCheckbox */}
                    <FormikCheckbox
                      name="newsletter"
                      label="Subscribe to newsletter"
                      helperText="Receive updates about new features and releases"
                      variant="outline"
                      size="md"
                    />

                    {/* FormikRadio */}
                    <FormikRadio
                      name="theme"
                      label="Theme Preference"
                      options={themeOptions}
                      isRequired
                      helperText="Choose your preferred color theme"
                    />

                    {/* FormikSwitch */}
                    <FormikSwitch
                      name="notifications"
                      label="Enable notifications"
                      helperText="Get notified about important updates"
                      size="md"
                    />

                    {/* Submit Button */}
                    <HStack gap={4} pt={4}>
                      <Button
                        type="submit"
                        loading={isSubmitting}
                        loadingText="Submitting..."
                        leftIcon={<RiSaveLine />}
                        colorPalette="green"
                        size="lg"
                        variant="solid"
                      >
                        Submit Form
                      </Button>
                      <Button
                        type="reset"
                        variant="outline"
                        size="lg"
                        leftIcon={<RiSearchLine />}
                      >
                        Reset
                      </Button>
                    </HStack>

                    {/* Debug Info */}
                    {Object.keys(values).some(
                      (key) => values[key as keyof typeof values]
                    ) && (
                      <Box mt={6} p={4} bg="bg.subtle" rounded="md">
                        <Text fontWeight="semibold" mb={2}>
                          Form Values:
                        </Text>
                        <Text as="pre" fontSize="sm" color="fg.muted">
                          {JSON.stringify(values, null, 2)}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </Form>
              )}
            </Formik>
          </Card.Body>
        </Card.Root>

        {/* Footer */}
        <Box textAlign="center" pt={8}>
          <Text color="fg.muted">
            All components are fully typed, accessible, and integrate seamlessly
            with Formik validation.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};
