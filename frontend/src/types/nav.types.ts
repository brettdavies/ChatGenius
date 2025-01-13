export enum DetailPanelType {
  THREAD = 'thread',
  PROFILE = 'profile',
  NONE = 'none'
}

export interface DetailPanel {
  type: DetailPanelType;
  isOpen: boolean;
  itemId: string | null; // threadId or userId
}

export interface NavigationState {
  activeChannelId: string | null;
  detailPanel: DetailPanel;
}

export interface NavigationUpdate {
  channelId?: string | null;
  detailPanel?: Partial<DetailPanel>;
} 