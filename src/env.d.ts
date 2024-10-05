/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REACT_APP_HOST: string;
  // Add other custom environment variables here
  // readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
