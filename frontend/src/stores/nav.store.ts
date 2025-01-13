import { create } from 'zustand';
import { Channel } from '@/types/channel.types';

interface NavigationState {
  activeChannel: Channel | null;
  detailPanelOpen: boolean;
}

interface NavActions {
  setActiveChannel: (channel: Channel | null) => void;
  toggleDetailPanel: () => void;
}

const initialState: NavigationState = {
  activeChannel: null,
  detailPanelOpen: false,
};

export const useNavStore = create<NavigationState & NavActions>((set) => ({
  ...initialState,
  
  setActiveChannel: (channel) => set({ activeChannel: channel }),
  toggleDetailPanel: () => set((state) => ({ detailPanelOpen: !state.detailPanelOpen })),
})); 