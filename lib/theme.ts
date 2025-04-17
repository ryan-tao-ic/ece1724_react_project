/**
 * Common theme tokens and utilities to maintain consistent design
 * This centralizes commonly used values that should remain consistent
 * across the application.
 */

// Common spacing values for margins and paddings
export const spacing = {
  xs: "space-y-2",
  sm: "space-y-4",
  md: "space-y-6",
  lg: "space-y-8",
  xl: "space-y-12",
} as const;

// Common border radius values
export const radius = {
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
} as const;

// Common shadow values
export const shadow = {
  sm: "shadow-sm",
  md: "shadow",
  lg: "shadow-md",
  xl: "shadow-lg",
} as const;

// Common animation values
export const animation = {
  fast: "transition-all duration-150",
  medium: "transition-all duration-300",
  slow: "transition-all duration-500",
} as const;

// Common container sizes
export const container = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
} as const;

// Common text sizes
export const text = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
} as const;

// Common button sizes
export const buttonSize = {
  sm: "px-2 py-1 text-sm",
  md: "px-4 py-2",
  lg: "px-6 py-3 text-lg",
} as const;

// Status colors
export const statusColors = {
  success: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
  },
  warning: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
  },
  error: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
  },
  info: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  neutral: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200",
  },
} as const;
