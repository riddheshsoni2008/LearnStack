declare module 'canvas-confetti' {
  const confetti: any;
  export default confetti;
}

declare var process: {
  env: {
    [key: string]: string | undefined;
  };
};

