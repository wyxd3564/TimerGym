/// <reference types="vite/client" />

// Allow importing static assets as URL strings
declare module '*.mp3' {
  const src: string;
  export default src;
}
