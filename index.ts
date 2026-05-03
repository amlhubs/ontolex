// @amlhubs/ontolex — W3C OntoLex-Lemon (Final CG Report 2016-05-10)
//
// Public entry point. The actual metaclass declarations live in
// `./src/ontolex.ts` and are inserted by the deploy implementation waves.
// This file mirrors the @amlhubs/sbvr facade pattern: a frozen lowercase
// dotted namespace `ontolex.{module}.{concept}` is exposed once the
// concrete classes exist.
//
// Until the implementation waves complete, this entry point only re-exports
// the module-namespace registry and the upstream type aliases that downstream
// consumers can already rely on.

export {
  OntolexModuleRegistry,
} from './src/ontolex.js';

export type {
  IOntolexModule,
  SbvrConceptDenoted,
} from './src/ontolex.js';
