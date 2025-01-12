import { create } from 'zustand';

interface NavState {
  activeChannel: string | null;
  activeThread: string | null;
  activeProfile: string | null;
  detailPanelOpen: boolean;
}

interface NavActions {
  setActiveChannel: (id: string | null) => void;
  setActiveThread: (id: string | null) => void;
  setActiveProfile: (id: string | null) => void;
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
  
  setActiveChannel: (id) => set({ 
    activeChannel: id,
    // Clear other active states when changing channel
    activeThread: null,
    activeProfile: null,
    detailPanelOpen: false
  }),
  
  setActiveThread: (id) => set({ 
    activeThread: id,
    // Open detail panel when thread is active
    detailPanelOpen: !!id,
    // Clear profile if active
    activeProfile: null
  }),
  
  setActiveProfile: (id) => set({ 
    activeProfile: id,
    // Open detail panel when profile is active
    detailPanelOpen: !!id,
    // Clear thread if active
    activeThread: null
  }),
  
  toggleDetailPanel: () => set((state) => ({ 
    detailPanelOpen: !state.detailPanelOpen,
    // Clear detail content if closing
    ...(state.detailPanelOpen ? {
      activeThread: null,
      activeProfile: null
    } : {})
  })),
  
  reset: () => set(initialState)
})); 