declare module 'vueRemote/*' {
  const value: {
    mount: (el: HTMLElement | null, props: any) => void;
    // other exports may exist
  };
  export = value;
}
