// js-interpreter has no type declarations. The runtime only uses it through src/runtime/host.ts and run.ts.
declare module 'js-interpreter' {
  const Interpreter: any;
  export default Interpreter;
}
