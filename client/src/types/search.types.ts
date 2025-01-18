export interface SearchFilters {
  channels: {
    include: string[];
    exclude: string[];
  };
  users: {
    include: string[];
    exclude: string[];
  };
  hasThread?: boolean;
  excludeThread?: boolean;
  dateRange?: {
    before?: string;
    after?: string;
  };
} 