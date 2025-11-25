import * as Yup from 'yup';

const emailYup = Yup.string()
  .email('Invalid Email')
  .required('Email is Required');

export const loginSchema = Yup.object().shape({
  email: emailYup,
  password: Yup.string().required(' Password Required'),
});

export const forgotSchema = Yup.object().shape({
  email: emailYup,
});

export const registerSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .min(10, 'Phone number must be at least 10 characters')
    .required('Phone number is required'),
  email: emailYup,
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .required('Password is required'),
});

export const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Password confirmation is required'),
});

export const verifyOtpSchema = Yup.object().shape({
  otp: Yup.string()
    .length(6, 'OTP must be exactly 6 digits')
    .matches(/^\d+$/, 'OTP must contain only numbers')
    .required('OTP is required'),
});
