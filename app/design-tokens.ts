// Centralized Design System for Quiet Mirror
// All colors, branding, and styling should come from here

export const colors = {
  // Primary brand colors
  brand: {
    primary: '#3B82F6',    // Blue - main brand color
    secondary: '#10B981',   // Green - accent color
    accent: '#8B5CF6',      // Purple - highlights
  },
  
  // Text colors
  text: {
    primary: '#111827',     // Dark gray for main text
    secondary: '#6B7280',   // Light gray for secondary text
    light: '#9CA3AF',       // Even lighter for placeholders
    white: '#FFFFFF',       // White text on dark backgrounds
  },
  
  // Background colors
  background: {
    primary: '#FFFFFF',     // White background
    secondary: '#F9FAFB',   // Off-white for cards
    dark: '#1F2937',        // Dark mode background
  },
  
  // Status colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
}

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
}

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    serif: 'Georgia, Times, serif',
    mono: 'Menlo, Monaco, monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
  },
}

export const branding = {
  siteName: 'Quiet Mirror',
  siteUrl: 'https://quietmirror.me',
  tagline: 'The Journal That Reads Underneath',
  description: 'A private AI journal that reads what you write and gently reflects it back.',
}
