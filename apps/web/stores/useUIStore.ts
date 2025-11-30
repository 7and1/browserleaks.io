import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'system';
export type Locale = 'en' | 'zh' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'pt' | 'ru' | 'ar';

interface UIState {
  // Theme
  theme: Theme;
  resolvedTheme: 'dark' | 'light';

  // Locale
  locale: Locale;

  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Modals
  activeModal: string | null;
  modalData: Record<string, unknown>;

  // Toast notifications
  toasts: Toast[];

  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;

  // Mobile
  isMobile: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  setIsMobile: (isMobile: boolean) => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

function generateToastId(): string {
  return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Default state
        theme: 'dark',
        resolvedTheme: 'dark',
        locale: 'en',
        sidebarOpen: true,
        sidebarCollapsed: false,
        activeModal: null,
        modalData: {},
        toasts: [],
        globalLoading: false,
        loadingMessage: null,
        isMobile: false,

        setTheme: (theme: Theme) => {
          const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
          set({ theme, resolvedTheme });

          // Update document class for Tailwind dark mode
          if (typeof document !== 'undefined') {
            document.documentElement.classList.remove('dark', 'light');
            document.documentElement.classList.add(resolvedTheme);
          }
        },

        setLocale: (locale: Locale) => {
          set({ locale });

          // Update document lang attribute
          if (typeof document !== 'undefined') {
            document.documentElement.lang = locale;
          }
        },

        toggleSidebar: () => {
          set((state) => ({ sidebarOpen: !state.sidebarOpen }));
        },

        setSidebarOpen: (open: boolean) => {
          set({ sidebarOpen: open });
        },

        setSidebarCollapsed: (collapsed: boolean) => {
          set({ sidebarCollapsed: collapsed });
        },

        openModal: (modalId: string, data?: Record<string, unknown>) => {
          set({
            activeModal: modalId,
            modalData: data || {},
          });
        },

        closeModal: () => {
          set({
            activeModal: null,
            modalData: {},
          });
        },

        addToast: (toast: Omit<Toast, 'id'>) => {
          const id = generateToastId();
          const newToast: Toast = {
            ...toast,
            id,
            duration: toast.duration ?? 5000,
          };

          set((state) => ({
            toasts: [...state.toasts, newToast],
          }));

          // Auto-remove toast after duration
          if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
              get().removeToast(id);
            }, newToast.duration);
          }
        },

        removeToast: (id: string) => {
          set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
          }));
        },

        setGlobalLoading: (loading: boolean, message?: string) => {
          set({
            globalLoading: loading,
            loadingMessage: loading ? (message ?? null) : null,
          });
        },

        setIsMobile: (isMobile: boolean) => {
          set({ isMobile });
        },
      }),
      {
        name: 'browserleaks-ui-store',
        partialize: (state) => ({
          theme: state.theme,
          locale: state.locale,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);

// Initialize theme on client side
if (typeof window !== 'undefined') {
  const store = useUIStore.getState();
  store.setTheme(store.theme);

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = useUIStore.getState().theme;
    if (currentTheme === 'system') {
      useUIStore.getState().setTheme('system');
    }
  });

  // Set initial mobile state
  const checkMobile = () => {
    useUIStore.getState().setIsMobile(window.innerWidth < 768);
  };
  checkMobile();
  window.addEventListener('resize', checkMobile);
}
