// @amlhubs/ontolex — W3C OntoLex-Lemon (Final CG Report 2016-05-10)
//
// Public entry point. The metaclass declarations live in `./src/ontolex.ts`
// and follow the Three-Layer Pattern (interface + abstract + concrete) per
// /.claude/rules/convention/abstract-class.md.
//
// This facade mirrors the @amlhubs/sbvr pattern: a frozen lowercase dotted
// namespace `ontolex.{module}.{concept}` is exposed for call-site convenience,
// alongside named re-exports of every concrete class and type-only re-exports
// of every interface and Layer-2 abstract.
//
// Module breakdown (per W3C OntoLex Final CG Report 2016-05-10 §1.4):
//   - ontolex.core.*    — Core (LexicalEntry, Word, MultiWordExpression,
//                                Affix, Form, LexicalSense, LexicalConcept,
//                                ConceptSet)
//   - ontolex.synsem.*  — Syntax-Semantics (SyntacticFrame,
//                                SyntacticArgument, OntoMap)
//   - ontolex.decomp.*  — Decomposition (Component)
//   - ontolex.vartrans.* — Variation/Translation (LexicalRelation,
//                                SenseRelation, ConceptualRelation,
//                                TerminologicalRelation, Translation,
//                                TranslationSet)
//   - ontolex.lime.*    — Linguistic Metadata (Lexicon, LexicalLinkset,
//                                LexicalizationSet, ConceptualizationSet)

import * as Raw from './src/ontolex.js';

// ─── ontolex.core ────────────────────────────────────────────────────────────
const coreLexicalentry = { LexicalEntry: Raw.LexicalEntry } as const;
const coreWord = { Word: Raw.Word } as const;
const coreMultiwordexpression = { MultiWordExpression: Raw.MultiWordExpression } as const;
const coreAffix = { Affix: Raw.Affix } as const;
const coreForm = { Form: Raw.Form } as const;
const coreLexicalsense = { LexicalSense: Raw.LexicalSense } as const;
const coreLexicalconcept = { LexicalConcept: Raw.LexicalConcept } as const;
const coreConceptset = { ConceptSet: Raw.ConceptSet } as const;

const core = {
  lexicalentry:        coreLexicalentry,
  word:                coreWord,
  multiwordexpression: coreMultiwordexpression,
  affix:               coreAffix,
  form:                coreForm,
  lexicalsense:        coreLexicalsense,
  lexicalconcept:      coreLexicalconcept,
  conceptset:          coreConceptset,
} as const;

// ─── ontolex.synsem ──────────────────────────────────────────────────────────
const synsemSyntacticframe = { SyntacticFrame: Raw.SyntacticFrame } as const;
const synsemSyntacticargument = { SyntacticArgument: Raw.SyntacticArgument } as const;
const synsemOntomap = { OntoMap: Raw.OntoMap } as const;

const synsem = {
  syntacticframe:    synsemSyntacticframe,
  syntacticargument: synsemSyntacticargument,
  ontomap:           synsemOntomap,
} as const;

// ─── ontolex.decomp ──────────────────────────────────────────────────────────
const decompComponent = { Component: Raw.Component } as const;

const decomp = {
  component: decompComponent,
} as const;

// ─── ontolex.vartrans ────────────────────────────────────────────────────────
const vartransLexicalrelation = { LexicalRelation: Raw.LexicalRelation } as const;
const vartransSenserelation = { SenseRelation: Raw.SenseRelation } as const;
const vartransConceptualrelation = { ConceptualRelation: Raw.ConceptualRelation } as const;
const vartransTerminologicalrelation = { TerminologicalRelation: Raw.TerminologicalRelation } as const;
const vartransTranslation = { Translation: Raw.Translation } as const;
const vartransTranslationset = { TranslationSet: Raw.TranslationSet } as const;

const vartrans = {
  lexicalrelation:        vartransLexicalrelation,
  senserelation:          vartransSenserelation,
  conceptualrelation:     vartransConceptualrelation,
  terminologicalrelation: vartransTerminologicalrelation,
  translation:            vartransTranslation,
  translationset:         vartransTranslationset,
} as const;

// ─── ontolex.lime ────────────────────────────────────────────────────────────
const limeLexicon = { Lexicon: Raw.Lexicon } as const;
const limeLexicallinkset = { LexicalLinkset: Raw.LexicalLinkset } as const;
const limeLexicalizationset = { LexicalizationSet: Raw.LexicalizationSet } as const;
const limeConceptualizationset = { ConceptualizationSet: Raw.ConceptualizationSet } as const;

const lime = {
  lexicon:              limeLexicon,
  lexicallinkset:       limeLexicallinkset,
  lexicalizationset:    limeLexicalizationset,
  conceptualizationset: limeConceptualizationset,
} as const;

// ─── Root namespace ──────────────────────────────────────────────────────────
export const ontolex = {
  core,
  synsem,
  decomp,
  vartrans,
  lime,
} as const;

// Named sub-namespace re-exports (tree-shakeable)
export { core, synsem, decomp, vartrans, lime };

// ─── Module-namespace registry + branded carrier (runtime + type) ────────────
export { OntolexModuleRegistry } from './src/ontolex.js';
export type { IOntolexModule, SbvrConceptDenoted } from './src/ontolex.js';

// ─── Concrete class re-exports ───────────────────────────────────────────────
export {
  // Core
  LexicalEntry,
  Word,
  MultiWordExpression,
  Affix,
  Form,
  LexicalSense,
  LexicalConcept,
  ConceptSet,
  // SynSem
  SyntacticFrame,
  SyntacticArgument,
  OntoMap,
  // Decomp
  Component,
  // Vartrans
  LexicalRelation,
  SenseRelation,
  ConceptualRelation,
  TerminologicalRelation,
  Translation,
  TranslationSet,
  // Lime
  Lexicon,
  LexicalLinkset,
  LexicalizationSet,
  ConceptualizationSet,
} from './src/ontolex.js';

// ─── Layer-2 abstract class re-exports ───────────────────────────────────────
export {
  AbstractLexicalEntry,
  AbstractWord,
  AbstractMultiWordExpression,
  AbstractAffix,
  AbstractForm,
  AbstractLexicalSense,
  AbstractLexicalConcept,
  AbstractConceptSet,
  AbstractSyntacticFrame,
  AbstractSyntacticArgument,
  AbstractOntoMap,
  AbstractComponent,
  AbstractLexicoSemanticRelation,
  AbstractLexicalRelation,
  AbstractSenseRelation,
  AbstractConceptualRelation,
  AbstractTerminologicalRelation,
  AbstractTranslation,
  AbstractTranslationSet,
  AbstractLexicon,
  AbstractLexicalLinkset,
  AbstractLexicalizationSet,
  AbstractConceptualizationSet,
} from './src/ontolex.js';

// ─── Layer-1 interface type-only re-exports ──────────────────────────────────
export type {
  // Core
  ILexicalEntry,
  IWord,
  IMultiWordExpression,
  IAffix,
  IForm,
  ILexicalSense,
  ILexicalConcept,
  IConceptSet,
  // SynSem
  ISyntacticFrame,
  ISyntacticArgument,
  IOntoMap,
  // Decomp
  IComponent,
  // Vartrans
  ILexicoSemanticRelation,
  ILexicalRelation,
  ISenseRelation,
  IConceptualRelation,
  ITerminologicalRelation,
  ITranslation,
  ITranslationSet,
  // Lime
  ILexicon,
  ILexicalLinkset,
  ILexicalizationSet,
  IConceptualizationSet,
} from './src/ontolex.js';
