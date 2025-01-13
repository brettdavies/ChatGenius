export interface ThemeConfig {
  colorMode: 'light' | 'dark' | 'system';
  fontSize: {
    base: string;
    small: string;
    large: string;
  };
  spacing: {
    base: number;
    small: number;
    medium: number;
    large: number;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
    full: string;
  };
  animation: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      default: string;
      smooth: string;
      bounce: string;
    };
  };
}

export const themeConfig: ThemeConfig = {
  colorMode: 'system',
  fontSize: {
    base: '1rem',
    small: '0.875rem',
    large: '1.125rem'
  },
  spacing: {
    base: 4,
    small: 2,
    medium: 8,
    large: 16
  },
  borderRadius: {
    small: '0.25rem',
    medium: '0.5rem',
    large: '1rem',
    full: '9999px'
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.6, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  }
}; 