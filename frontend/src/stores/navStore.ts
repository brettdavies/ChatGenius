import { create } from 'zustand';

interface NavState {
  activeChannel: string | null;
  activeThread: string | null;
  activeProfile: string | null;
  detailPanelOpen: boolean;
}

interface NavActions {
  setActiveChannel: (channelId: string | null) => void;
  setActiveThread: (threadId: string | null) => void;
  setActiveProfile: (userId: string | null) => void;
  toggleDetailPanel: () => void;
  reset: () => void;
}

const initialState: NavState = {
  activeChannel: null,
  activeThread: null,
  activeProfile: null,
  detailPanelOpen: false,
};

export const useNavStore = create<NavState & NavActions>((set) => ({
  ...initialState,

  setActiveChannel: (channelId) =>
    set(() => ({
      activeChannel: channelId,
      // Clear other active states when changing channels
      activeThread: null,
      activeProfile: null,
      detailPanelOpen: false,
    })),

  setActiveThread: (threadId: string | null) =>
    set({
      activeThread: threadId,
      activeProfile: null,
      detailPanelOpen: !!threadId
    }),

  setActiveProfile: (userId: string | null) =>
    set({
      activeProfile: userId,
      activeThread: null,
      detailPanelOpen: !!userId
    }),

  toggleDetailPanel: () =>
    set((state) => ({
      detailPanelOpen: !state.detailPanelOpen,
      // Clear detail panel content if closing
      ...(state.detailPanelOpen
        ? { activeThread: null, activeProfile: null }
        : {}),
    })),

  reset: () => set(initialState),
})); 