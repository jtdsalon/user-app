import { createContext, useContext } from 'react';
import type { LayoutContextType } from '../../Home/types';

export interface ExtendedLayoutContextType extends LayoutContextType {
  followedUsers: string[];
  toggleFollowedUser: (id: string) => void;
  savedPosts: string[];
  toggleSavePost: (id: string) => void;
  isChatOpen?: boolean;
  setIsChatOpen?: (open: boolean) => void;
  isChatMinimized?: boolean;
  setIsChatMinimized?: (minimized: boolean) => void;
  unreadChatCount?: number;
}

const LayoutContext = createContext<ExtendedLayoutContextType | undefined>(undefined);

export { LayoutContext };

const LAYOUT_STUB: ExtendedLayoutContextType = {
  mode: 'light',
  toggleColorMode: () => {},
  favorites: [],
  toggleFavorite: () => {},
  followedUsers: [],
  toggleFollowedUser: () => {},
  savedPosts: [],
  toggleSavePost: () => {},
  cart: [],
  addToCart: () => {},
  lastBooked: null,
  handleOpenBooking: () => {},
  handleOpenArtistBooking: () => {},
  setIsSmartBookingOpen: () => {},
  isLoading: false,
  isChatOpen: false,
  setIsChatOpen: () => {},
  isChatMinimized: false,
  setIsChatMinimized: () => {},
};

export const useLayout = (): ExtendedLayoutContextType => {
  const context = useContext(LayoutContext);
  return context ?? LAYOUT_STUB;
};
