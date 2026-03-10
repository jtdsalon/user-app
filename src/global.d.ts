// Declare global augmentation for window to include Redux DevTools properties
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof import('redux').compose;
    __REDUX_DEVTOOLS_EXTENSION__?: any;
  }
}

export {};
