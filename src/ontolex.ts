// ═══════════════════════════════════════════════════════════════════════════
// ontolex.ts
// W3C OntoLex-Lemon — Lexicon Model for Ontologies
// Final Community Group Report, 10 May 2016
// https://www.w3.org/2016/05/ontolex/
//
// Modular vocabularies covered (each with its own RDF/OWL namespace):
//   - Core (`ontolex`)        — http://www.w3.org/ns/lemon/ontolex#
//   - SynSem (`synsem`)       — http://www.w3.org/ns/lemon/synsem#
//   - Decomposition (`decomp`)— http://www.w3.org/ns/lemon/decomp#
//   - Variation (`vartrans`)  — http://www.w3.org/ns/lemon/vartrans#
//   - Linguistic Metadata (`lime`) — http://www.w3.org/ns/lemon/lime#
//
// Scope: TypeScript surface for the OntoLex Final CG Report 2016-05-10
// metamodel — every OWL class declared in the five modular vocabularies is
// re-expressed as an interface (Layer 1) + abstract class (Layer 2) +
// concrete class (Layer 3) per /.claude/rules/convention/abstract-class.md.
//
// Generation chain:
//   @amlhubs/uml  (UML 2.5.1) ─upstream─►
//   @amlhubs/mof  (MOF 2.5.1) ─upstream─►
//   @amlhubs/sbvr (SBVR 1.5)  ─upstream─►
//   @amlhubs/ontolex (THIS FILE) ─consumes upstreams via `import type` only
//
// Architectural ordering:
//   OntoLex sits at the binding-to-ontology layer on top of the SBVR
//   linguistic-rules surface and the UML/MOF structural surface. Where SBVR
//   models *natural language about a domain* (Noun Concepts, Fact Types,
//   Designations), OntoLex models *the lexicon that grounds those concepts in
//   an ontology* — a LexicalEntry has a Form (orthographic surface) and a
//   LexicalSense (the sense-side mediator) that points (via `denotes` or
//   `reference`) at an ontology Class which IS an SBVR Concept rendered as a
//   UML Class.
//
//   Important: OntoLex `LexicalEntry`/`Form`/`Sense` overlap structurally with
//   the @agenihub/aml linguistical.md vocabulary (LexicalEntry, Form, Sense,
//   Lemma) and partially with LMF (ISO 24613). The deep-research §C-CRIT-01
//   ("LMF LexicalEntry ≠ OntoLex LexicalEntry ≠ TEI lex") records the
//   structural divergence. This package registers OntoLex concepts under the
//   `@amlhubs/ontolex` namespace and stays silent on cross-spec consensus —
//   that consensus belongs in a downstream `lexical-entry-consensus` package
//   that imports both.
//
// Pattern conformance:
//   - Three-Layer Pattern (interface + abstract + concrete) per /.claude/
//     rules/convention/abstract-class.md.
//   - Header banners + `// --- N. IFoo (§x.y) ---` markers per metaclass.
//   - JSDoc with @standard, @section (W3C report anchor), @metaclass,
//     @generalization, @definition, @ownedAttributes, @associationEnds.
//   - No `enum` declarations and no bare string-union types — closed sets
//     (e.g., the `LexicalForm` taxon split into `Word | MultiwordExpression |
//     Affix`) are expressed as discrete subtypes per the spec, not as a TS
//     enum or a `'word' | 'mwe' | 'affix'` literal union.
//   - Concrete classes appear after all interfaces and abstract classes in
//     `export class {Name} extends Abstract{Name}<RegisteredArguments>` form
//     where every type argument resolves to a registered AML Thing.
//
// @ontolex-coverage: Core (LexicalEntry, Word, MultiWordExpression, Affix,
//   Form, LexicalSense, LexicalConcept, ConceptSet), SynSem (SyntacticFrame,
//   SyntacticArgument, OntoMap), Decomp (Component), Vartrans (LexicoSemanticRelation,
//   LexicalRelation, SenseRelation, ConceptualRelation, TerminologicalRelation,
//   Translation, TranslationSet), Lime (Lexicon, LexicalLinkset,
//   LexicalizationSet, ConceptualizationSet).
// ═══════════════════════════════════════════════════════════════════════════

// UML 2.5.1 metaclasses — used to root OntoLex Elements per the same Clause 8
// grounding SBVR uses (every NamedElement-rooted concept is an IElement).
import type {
  IElement,
} from '@amlhubs/uml';

// MOF 2.5.1 metaclasses — reflective access for serialization round-trips
// (an OntoLex Lexicon may be exchanged as a MOF object alongside its
// UML/RDF/OWL realizations).
import type { IMofObject } from '@amlhubs/mof';

// SBVR 1.5 metaclasses — OntoLex `Reference` (denotes) points at an ontology
// concept that IS an SBVR `IObjectType` rendered as a UML Class. The
// type-only import keeps the SBVR surface available for cross-spec
// projection without polluting the OntoLex runtime surface.
import type {
  IObjectType as _SbvrIObjectType,
} from '@amlhubs/sbvr';

// Re-exported as a documentation-only type alias so consumers can name the
// SBVR Concept that an OntoLex Reference denotes.
export type SbvrConceptDenoted = _SbvrIObjectType;

// Local mirror of MOF reflective protocol, matching the SBVR pattern.
/** @local mirror of OMG MOF 2.5.1 §14.4 Reflection::Object — not exported by @amlhubs/mof index */
interface _IMofReflectiveProtocol {
  readonly mofVersion: string;
  getProperty(propertyName: string): unknown;
  setProperty(propertyName: string, value: unknown): boolean;
  isPropertySet(propertyName: string): boolean;
  unsetProperty(propertyName: string): boolean;
  getMetaClass(): string;
  containerOf(): IMofObject<unknown> | undefined;
  equalsObject(other: IMofObject<unknown>): boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE-NAMESPACE CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
// Per Final CG Report §1.4, each OntoLex module owns its own RDF namespace.
// Concrete classes carry a `readonly module` field whose type narrows to one
// of these branded interfaces.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §1.4
 * @section §1.4
 * Closed-set registry of OntoLex module URIs. Each concrete class lives in
 * exactly one module; the registry is the lookup index.
 */
export const OntolexModuleRegistry = {
  Ontolex:  'http://www.w3.org/ns/lemon/ontolex#',
  Synsem:   'http://www.w3.org/ns/lemon/synsem#',
  Decomp:   'http://www.w3.org/ns/lemon/decomp#',
  Vartrans: 'http://www.w3.org/ns/lemon/vartrans#',
  Lime:     'http://www.w3.org/ns/lemon/lime#',
} as const;

/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §1.4
 * @section §1.4
 * Branded carrier for OntolexModuleRegistry values.
 */
export interface IOntolexModule<
    Token extends typeof OntolexModuleRegistry[keyof typeof OntolexModuleRegistry] =
        typeof OntolexModuleRegistry[keyof typeof OntolexModuleRegistry]> {
  readonly token: Token;
  readonly brand: 'ontolex.Module';
}

// ═══════════════════════════════════════════════════════════════════════════
// CORE MODULE (`ontolex`) — § Final CG Report §3
// http://www.w3.org/ns/lemon/ontolex#
// ═══════════════════════════════════════════════════════════════════════════

// --- 1. ILexicalEntry (§3.1) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §3.1
 * @metaclass concrete
 * @generalization IElement (UML), semiotics:Expression
 * @definition A lexical entry represents a unit of analysis of the lexicon
 *   that consists of a set of forms that are grammatically related and a set
 *   of base meanings that are associated with all of these forms. Thus, a
 *   lexical entry is a word, multiword expression or affix with a single
 *   part-of-speech, morphological pattern, etymology and set of senses.
 * @ownedAttributes
 *   id : String [1] -- the IRI identifier of the lexical entry
 * @associationEnds
 *   canonicalForm : Form [0..1] -- the canonical (lemma/citation) form
 *   otherForm : Form [*] -- alternative/inflected forms (different from canonical)
 *   lexicalForm : Form [1..*] -- all forms of this entry (canonical + other)
 *   sense : LexicalSense [*] -- senses lexicalized by this entry
 *   evokes : LexicalConcept [*] -- lexical concepts evoked by this entry
 *   morphologicalPattern : String [0..*] -- morphological pattern URI references
 *   language : String [0..1] -- ISO 639-3 language tag
 * @constraints
 *   [maxCanonicalFormCardinality]: canonicalForm.size() <= 1
 *     -- §3.1: a lexical entry has at most one canonical form.
 *   [minLexicalFormCardinality]: lexicalForm.size() >= 1
 *     -- §3.1: a lexical entry has at least one lexical form.
 */
export interface ILexicalEntry<
    LF extends IForm<any> = IForm<any>,
    CF extends IForm<any> = IForm<any>,
    OF extends IForm<any> = IForm<any>,
    LS extends ILexicalSense<any, any> = ILexicalSense<any, any>,
    LC extends ILexicalConcept<any> = ILexicalConcept<any>>
  extends IElement {
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Ontolex>;
  readonly canonicalForm?: CF;
  readonly otherForm: ReadonlyArray<OF>;
  readonly lexicalForm: ReadonlyArray<LF>;
  readonly sense: ReadonlyArray<LS>;
  readonly evokes: ReadonlyArray<LC>;
  readonly morphologicalPattern: ReadonlyArray<string>;
  readonly language?: string;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §3.1 */
export abstract class AbstractLexicalEntry<
    const LF extends IForm<any> = IForm<any>,
    const CF extends IForm<any> = IForm<any>,
    const OF extends IForm<any> = IForm<any>,
    const LS extends ILexicalSense<any, any> = ILexicalSense<any, any>,
    const LC extends ILexicalConcept<any> = ILexicalConcept<any>>
  implements ILexicalEntry<LF, CF, OF, LS, LC> {
  // IElement members — concretely implemented; concrete subclasses may override
  readonly ownedCommentIds: ReadonlyArray<string> = [];
  readonly ownedElementIds: ReadonlyArray<string> = [];
  readonly ownerId: string | undefined = undefined;
  allOwnedElements(): ReadonlyArray<string> { return this.ownedElementIds; }
  mustBeOwned(): boolean { return false; }
  // OntoLex members
  abstract readonly id: string;
  abstract readonly module: IOntolexModule<typeof OntolexModuleRegistry.Ontolex>;
  abstract readonly canonicalForm?: CF;
  abstract readonly otherForm: ReadonlyArray<OF>;
  abstract readonly lexicalForm: ReadonlyArray<LF>;
  abstract readonly sense: ReadonlyArray<LS>;
  abstract readonly evokes: ReadonlyArray<LC>;
  abstract readonly morphologicalPattern: ReadonlyArray<string>;
  abstract readonly language?: string;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §3.1 — concrete LexicalEntry */
export class LexicalEntry
  extends AbstractLexicalEntry<IForm<any>, IForm<any>, IForm<any>, ILexicalSense<any, any>, ILexicalConcept<any>> {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Ontolex>;
  readonly canonicalForm?: IForm<any>;
  readonly otherForm: ReadonlyArray<IForm<any>>;
  readonly lexicalForm: ReadonlyArray<IForm<any>>;
  readonly sense: ReadonlyArray<ILexicalSense<any, any>>;
  readonly evokes: ReadonlyArray<ILexicalConcept<any>>;
  readonly morphologicalPattern: ReadonlyArray<string>;
  readonly language?: string;
  constructor(data: {
    id: string;
    canonicalForm?: IForm<any>;
    otherForm?: ReadonlyArray<IForm<any>>;
    lexicalForm: ReadonlyArray<IForm<any>>;
    sense?: ReadonlyArray<ILexicalSense<any, any>>;
    evokes?: ReadonlyArray<ILexicalConcept<any>>;
    morphologicalPattern?: ReadonlyArray<string>;
    language?: string;
  }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Ontolex, brand: 'ontolex.Module' } as const;
    this.canonicalForm = data.canonicalForm;
    this.otherForm = data.otherForm ?? [];
    this.lexicalForm = data.lexicalForm;
    this.sense = data.sense ?? [];
    this.evokes = data.evokes ?? [];
    this.morphologicalPattern = data.morphologicalPattern ?? [];
    this.language = data.language;
  }
}

// --- 2. IWord (§3.1.1) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §3.1.1
 * @metaclass concrete
 * @generalization ILexicalEntry
 * @definition A lexical entry that is a single word.
 */
export interface IWord<
    LF extends IForm<any> = IForm<any>,
    CF extends IForm<any> = IForm<any>,
    OF extends IForm<any> = IForm<any>,
    LS extends ILexicalSense<any, any> = ILexicalSense<any, any>,
    LC extends ILexicalConcept<any> = ILexicalConcept<any>>
  extends ILexicalEntry<LF, CF, OF, LS, LC> {}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §3.1.1 */
export abstract class AbstractWord<
    const LF extends IForm<any> = IForm<any>,
    const CF extends IForm<any> = IForm<any>,
    const OF extends IForm<any> = IForm<any>,
    const LS extends ILexicalSense<any, any> = ILexicalSense<any, any>,
    const LC extends ILexicalConcept<any> = ILexicalConcept<any>>
  extends AbstractLexicalEntry<LF, CF, OF, LS, LC>
  implements IWord<LF, CF, OF, LS, LC> {}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §3.1.1 — concrete Word */
export class Word extends LexicalEntry implements IWord {}

// --- 3. IMultiWordExpression (§3.1.2) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §3.1.2
 * @metaclass concrete
 * @generalization ILexicalEntry
 * @definition A lexical entry that consists of two or more words. Note: the
 *   OWL class name in the spec is `MultiWordExpression` (capital W); some
 *   publications colloquially write `MultiwordExpression`.
 */
export interface IMultiWordExpression<
    LF extends IForm<any> = IForm<any>,
    CF extends IForm<any> = IForm<any>,
    OF extends IForm<any> = IForm<any>,
    LS extends ILexicalSense<any, any> = ILexicalSense<any, any>,
    LC extends ILexicalConcept<any> = ILexicalConcept<any>>
  extends ILexicalEntry<LF, CF, OF, LS, LC> {}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §3.1.2 */
export abstract class AbstractMultiWordExpression<
    const LF extends IForm<any> = IForm<any>,
    const CF extends IForm<any> = IForm<any>,
    const OF extends IForm<any> = IForm<any>,
    const LS extends ILexicalSense<any, any> = ILexicalSense<any, any>,
    const LC extends ILexicalConcept<any> = ILexicalConcept<any>>
  extends AbstractLexicalEntry<LF, CF, OF, LS, LC>
  implements IMultiWordExpression<LF, CF, OF, LS, LC> {}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §3.1.2 — concrete MultiWordExpression */
export class MultiWordExpression extends LexicalEntry implements IMultiWordExpression {}

// --- 4. IAffix (§3.1.3) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §3.1.3
 * @metaclass concrete
 * @generalization ILexicalEntry
 * @definition A lexical entry that is an affix (a prefix, suffix, infix or
 *   circumfix) — that is, a part of a word that may be added to a stem to
 *   form a new word.
 */
export interface IAffix<
    LF extends IForm<any> = IForm<any>,
    CF extends IForm<any> = IForm<any>,
    OF extends IForm<any> = IForm<any>,
    LS extends ILexicalSense<any, any> = ILexicalSense<any, any>,
    LC extends ILexicalConcept<any> = ILexicalConcept<any>>
  extends ILexicalEntry<LF, CF, OF, LS, LC> {}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §3.1.3 */
export abstract class AbstractAffix<
    const LF extends IForm<any> = IForm<any>,
    const CF extends IForm<any> = IForm<any>,
    const OF extends IForm<any> = IForm<any>,
    const LS extends ILexicalSense<any, any> = ILexicalSense<any, any>,
    const LC extends ILexicalConcept<any> = ILexicalConcept<any>>
  extends AbstractLexicalEntry<LF, CF, OF, LS, LC>
  implements IAffix<LF, CF, OF, LS, LC> {}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §3.1.3 — concrete Affix */
export class Affix extends LexicalEntry implements IAffix {}

// --- 5. IForm (§3.2) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §3.2
 * @metaclass concrete
 * @generalization IElement (UML), semiotics:Expression
 * @definition A form represents one grammatical realization of a lexical
 *   entry. A given form may have multiple representations of various kinds
 *   (orthographic, phonetic, etc.).
 * @ownedAttributes
 *   id : String [1]
 *   writtenRep : LangString [0..*] -- the orthographic surface form (literal
 *                                     with optional language tag, per §3.2)
 *   phoneticRep : LangString [0..*] -- the phonetic surface form
 *   representation : LangString [0..*] -- a generic representation (the
 *                                          super-property of writtenRep and
 *                                          phoneticRep per §3.2)
 */
export interface IForm<W extends string = string> extends IElement {
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Ontolex>;
  readonly writtenRep: ReadonlyArray<W>;
  readonly phoneticRep: ReadonlyArray<string>;
  readonly representation: ReadonlyArray<string>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §3.2 */
export abstract class AbstractForm<const W extends string = string>
  implements IForm<W> {
  readonly ownedCommentIds: ReadonlyArray<string> = [];
  readonly ownedElementIds: ReadonlyArray<string> = [];
  readonly ownerId: string | undefined = undefined;
  allOwnedElements(): ReadonlyArray<string> { return this.ownedElementIds; }
  mustBeOwned(): boolean { return false; }
  abstract readonly id: string;
  abstract readonly module: IOntolexModule<typeof OntolexModuleRegistry.Ontolex>;
  abstract readonly writtenRep: ReadonlyArray<W>;
  abstract readonly phoneticRep: ReadonlyArray<string>;
  abstract readonly representation: ReadonlyArray<string>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §3.2 — concrete Form */
export class Form extends AbstractForm<string> {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Ontolex>;
  readonly writtenRep: ReadonlyArray<string>;
  readonly phoneticRep: ReadonlyArray<string>;
  readonly representation: ReadonlyArray<string>;
  constructor(data: {
    id: string;
    writtenRep?: ReadonlyArray<string>;
    phoneticRep?: ReadonlyArray<string>;
    representation?: ReadonlyArray<string>;
  }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Ontolex, brand: 'ontolex.Module' } as const;
    this.writtenRep = data.writtenRep ?? [];
    this.phoneticRep = data.phoneticRep ?? [];
    this.representation = data.representation ?? [];
  }
}

// --- 6. ILexicalSense (§3.3) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §3.3
 * @metaclass concrete
 * @generalization IElement (UML), semiotics:Meaning
 * @definition A lexical sense represents the lexical meaning of a lexical
 *   entry when interpreted as referring to the corresponding ontology
 *   element. A LexicalSense is a reified link between a LexicalEntry and an
 *   ontology Reference; it enables annotations to be made on the link itself.
 * @associationEnds
 *   isSenseOf : LexicalEntry [0..1] -- inverse of LexicalEntry.sense
 *   reference : Reference (rdfs:Resource) [0..1] -- the ontology element this
 *               sense maps the lexical entry to (per §3.5)
 *   isReferenceOf : Reference (rdfs:Resource) [0..1] -- inverse of reference
 *   isLexicalizedSenseOf : LexicalConcept [0..1] -- inverse of
 *                          LexicalConcept.lexicalizedSense
 *   usage : String [0..*] -- usage examples or notes
 */
export interface ILexicalSense<
    LE extends ILexicalEntry<any, any, any, any, any> = ILexicalEntry<any, any, any, any, any>,
    LC extends ILexicalConcept<any> = ILexicalConcept<any>>
  extends IElement {
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Ontolex>;
  readonly isSenseOf?: LE;
  readonly reference?: string;
  readonly isReferenceOf?: string;
  readonly isLexicalizedSenseOf?: LC;
  readonly usage: ReadonlyArray<string>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §3.3 */
export abstract class AbstractLexicalSense<
    const LE extends ILexicalEntry<any, any, any, any, any> = ILexicalEntry<any, any, any, any, any>,
    const LC extends ILexicalConcept<any> = ILexicalConcept<any>>
  implements ILexicalSense<LE, LC> {
  readonly ownedCommentIds: ReadonlyArray<string> = [];
  readonly ownedElementIds: ReadonlyArray<string> = [];
  readonly ownerId: string | undefined = undefined;
  allOwnedElements(): ReadonlyArray<string> { return this.ownedElementIds; }
  mustBeOwned(): boolean { return false; }
  abstract readonly id: string;
  abstract readonly module: IOntolexModule<typeof OntolexModuleRegistry.Ontolex>;
  abstract readonly isSenseOf?: LE;
  abstract readonly reference?: string;
  abstract readonly isReferenceOf?: string;
  abstract readonly isLexicalizedSenseOf?: LC;
  abstract readonly usage: ReadonlyArray<string>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §3.3 — concrete LexicalSense */
export class LexicalSense extends AbstractLexicalSense<ILexicalEntry<any, any, any, any, any>, ILexicalConcept<any>> {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Ontolex>;
  readonly isSenseOf?: ILexicalEntry<any, any, any, any, any>;
  readonly reference?: string;
  readonly isReferenceOf?: string;
  readonly isLexicalizedSenseOf?: ILexicalConcept<any>;
  readonly usage: ReadonlyArray<string>;
  constructor(data: {
    id: string;
    isSenseOf?: ILexicalEntry<any, any, any, any, any>;
    reference?: string;
    isReferenceOf?: string;
    isLexicalizedSenseOf?: ILexicalConcept<any>;
    usage?: ReadonlyArray<string>;
  }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Ontolex, brand: 'ontolex.Module' } as const;
    this.isSenseOf = data.isSenseOf;
    this.reference = data.reference;
    this.isReferenceOf = data.isReferenceOf;
    this.isLexicalizedSenseOf = data.isLexicalizedSenseOf;
    this.usage = data.usage ?? [];
  }
}

// --- 7. ILexicalConcept (§3.4) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §3.4
 * @metaclass concrete
 * @generalization IElement (UML), semiotics:Meaning, skos:Concept
 * @definition A LexicalConcept is a mental abstraction, group of mental
 *   abstractions or unit of thought that may be lexicalized by a (set of)
 *   LexicalEntries. A LexicalConcept may be considered as the cognitive
 *   correlate of a LexicalSense.
 * @associationEnds
 *   isEvokedBy : LexicalEntry [*] -- inverse of LexicalEntry.evokes
 *   lexicalizedSense : LexicalSense [*] -- senses that lexicalize this
 *                      concept (inverse of LexicalSense.isLexicalizedSenseOf)
 *   concept : skos:Concept [*] -- the underlying SKOS concept(s)
 *   isConceptOf : skos:Concept [*] -- inverse of concept
 */
export interface ILexicalConcept<
    LE extends ILexicalEntry<any, any, any, any, any> = ILexicalEntry<any, any, any, any, any>>
  extends IElement {
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Ontolex>;
  readonly isEvokedBy: ReadonlyArray<LE>;
  readonly lexicalizedSense: ReadonlyArray<ILexicalSense<any, any>>;
  readonly concept: ReadonlyArray<string>;
  readonly isConceptOf: ReadonlyArray<string>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §3.4 */
export abstract class AbstractLexicalConcept<
    const LE extends ILexicalEntry<any, any, any, any, any> = ILexicalEntry<any, any, any, any, any>>
  implements ILexicalConcept<LE> {
  readonly ownedCommentIds: ReadonlyArray<string> = [];
  readonly ownedElementIds: ReadonlyArray<string> = [];
  readonly ownerId: string | undefined = undefined;
  allOwnedElements(): ReadonlyArray<string> { return this.ownedElementIds; }
  mustBeOwned(): boolean { return false; }
  abstract readonly id: string;
  abstract readonly module: IOntolexModule<typeof OntolexModuleRegistry.Ontolex>;
  abstract readonly isEvokedBy: ReadonlyArray<LE>;
  abstract readonly lexicalizedSense: ReadonlyArray<ILexicalSense<any, any>>;
  abstract readonly concept: ReadonlyArray<string>;
  abstract readonly isConceptOf: ReadonlyArray<string>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §3.4 — concrete LexicalConcept */
export class LexicalConcept extends AbstractLexicalConcept<ILexicalEntry<any, any, any, any, any>> {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Ontolex>;
  readonly isEvokedBy: ReadonlyArray<ILexicalEntry<any, any, any, any, any>>;
  readonly lexicalizedSense: ReadonlyArray<ILexicalSense<any, any>>;
  readonly concept: ReadonlyArray<string>;
  readonly isConceptOf: ReadonlyArray<string>;
  constructor(data: {
    id: string;
    isEvokedBy?: ReadonlyArray<ILexicalEntry<any, any, any, any, any>>;
    lexicalizedSense?: ReadonlyArray<ILexicalSense<any, any>>;
    concept?: ReadonlyArray<string>;
    isConceptOf?: ReadonlyArray<string>;
  }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Ontolex, brand: 'ontolex.Module' } as const;
    this.isEvokedBy = data.isEvokedBy ?? [];
    this.lexicalizedSense = data.lexicalizedSense ?? [];
    this.concept = data.concept ?? [];
    this.isConceptOf = data.isConceptOf ?? [];
  }
}

// --- 8. IConceptSet (§3.4 / §7) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §3.4
 * @metaclass concrete
 * @generalization IElement (UML), skos:ConceptScheme
 * @definition A set of LexicalConcepts grouped together (extending
 *   skos:ConceptScheme so that it can be queried as a SKOS concept scheme).
 *   Used by Lime ConceptualizationSet to count members.
 */
export interface IConceptSet<LC extends ILexicalConcept<any> = ILexicalConcept<any>> extends IElement {
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Ontolex>;
  readonly concepts: ReadonlyArray<LC>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §3.4 */
export abstract class AbstractConceptSet<const LC extends ILexicalConcept<any> = ILexicalConcept<any>>
  implements IConceptSet<LC> {
  readonly ownedCommentIds: ReadonlyArray<string> = [];
  readonly ownedElementIds: ReadonlyArray<string> = [];
  readonly ownerId: string | undefined = undefined;
  allOwnedElements(): ReadonlyArray<string> { return this.ownedElementIds; }
  mustBeOwned(): boolean { return false; }
  abstract readonly id: string;
  abstract readonly module: IOntolexModule<typeof OntolexModuleRegistry.Ontolex>;
  abstract readonly concepts: ReadonlyArray<LC>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §3.4 — concrete ConceptSet */
export class ConceptSet extends AbstractConceptSet<ILexicalConcept<any>> {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Ontolex>;
  readonly concepts: ReadonlyArray<ILexicalConcept<any>>;
  constructor(data: { id: string; concepts?: ReadonlyArray<ILexicalConcept<any>> }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Ontolex, brand: 'ontolex.Module' } as const;
    this.concepts = data.concepts ?? [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SYNSEM MODULE (`synsem`) — § Final CG Report §4
// http://www.w3.org/ns/lemon/synsem#
// ═══════════════════════════════════════════════════════════════════════════

// --- 9. ISyntacticFrame (§4.1) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §4.1
 * @metaclass concrete
 * @generalization IElement (UML)
 * @definition A class representing the syntactic behavior of a lexical
 *   entry. A syntactic frame is a structure of syntactic arguments that a
 *   lexical entry expects (e.g., a transitive verb expects a subject and an
 *   object).
 * @associationEnds
 *   synArg : SyntacticArgument [*] -- the syntactic arguments of this frame
 */
export interface ISyntacticFrame<SA extends ISyntacticArgument = ISyntacticArgument> extends IElement {
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Synsem>;
  readonly synArg: ReadonlyArray<SA>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §4.1 */
export abstract class AbstractSyntacticFrame<const SA extends ISyntacticArgument = ISyntacticArgument>
  implements ISyntacticFrame<SA> {
  readonly ownedCommentIds: ReadonlyArray<string> = [];
  readonly ownedElementIds: ReadonlyArray<string> = [];
  readonly ownerId: string | undefined = undefined;
  allOwnedElements(): ReadonlyArray<string> { return this.ownedElementIds; }
  mustBeOwned(): boolean { return false; }
  abstract readonly id: string;
  abstract readonly module: IOntolexModule<typeof OntolexModuleRegistry.Synsem>;
  abstract readonly synArg: ReadonlyArray<SA>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §4.1 — concrete SyntacticFrame */
export class SyntacticFrame extends AbstractSyntacticFrame<ISyntacticArgument> {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Synsem>;
  readonly synArg: ReadonlyArray<ISyntacticArgument>;
  constructor(data: { id: string; synArg?: ReadonlyArray<ISyntacticArgument> }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Synsem, brand: 'ontolex.Module' } as const;
    this.synArg = data.synArg ?? [];
  }
}

// --- 10. ISyntacticArgument (§4.2) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §4.2
 * @metaclass concrete
 * @generalization IElement (UML)
 * @definition A class representing a syntactic argument of a syntactic
 *   frame; that is, an argument slot in a syntactic structure.
 * @associationEnds
 *   marker : LexicalEntry [0..*] -- syntactic role marker(s) (e.g.,
 *            preposition or case marker) that mark this argument
 */
export interface ISyntacticArgument<LE extends ILexicalEntry<any, any, any, any, any> = ILexicalEntry<any, any, any, any, any>>
  extends IElement {
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Synsem>;
  readonly marker: ReadonlyArray<LE>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §4.2 */
export abstract class AbstractSyntacticArgument<
    const LE extends ILexicalEntry<any, any, any, any, any> = ILexicalEntry<any, any, any, any, any>>
  implements ISyntacticArgument<LE> {
  readonly ownedCommentIds: ReadonlyArray<string> = [];
  readonly ownedElementIds: ReadonlyArray<string> = [];
  readonly ownerId: string | undefined = undefined;
  allOwnedElements(): ReadonlyArray<string> { return this.ownedElementIds; }
  mustBeOwned(): boolean { return false; }
  abstract readonly id: string;
  abstract readonly module: IOntolexModule<typeof OntolexModuleRegistry.Synsem>;
  abstract readonly marker: ReadonlyArray<LE>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §4.2 — concrete SyntacticArgument */
export class SyntacticArgument extends AbstractSyntacticArgument<ILexicalEntry<any, any, any, any, any>> {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Synsem>;
  readonly marker: ReadonlyArray<ILexicalEntry<any, any, any, any, any>>;
  constructor(data: { id: string; marker?: ReadonlyArray<ILexicalEntry<any, any, any, any, any>> }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Synsem, brand: 'ontolex.Module' } as const;
    this.marker = data.marker ?? [];
  }
}

// --- 11. IOntoMap (§4.3) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §4.3
 * @metaclass concrete
 * @generalization IElement (UML)
 * @definition The class of all syntax-to-semantics mapping individuals.
 *   An OntoMap relates syntactic arguments to ontological positions
 *   (subjOfProp / objOfProp / propertyDomain / propertyRange) and may carry
 *   a condition.
 * @associationEnds
 *   subjOfProp : SyntacticArgument [0..1]
 *   objOfProp : SyntacticArgument [0..1]
 *   propertyDomain : SyntacticArgument [0..1]
 *   propertyRange : SyntacticArgument [0..1]
 *   submap : OntoMap [0..*] -- nested mappings
 *   condition : String [0..1] -- a condition (e.g., SPARQL ASK) on the mapping
 */
export interface IOntoMap<SA extends ISyntacticArgument = ISyntacticArgument> extends IElement {
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Synsem>;
  readonly subjOfProp?: SA;
  readonly objOfProp?: SA;
  readonly propertyDomain?: SA;
  readonly propertyRange?: SA;
  readonly submap: ReadonlyArray<IOntoMap<SA>>;
  readonly condition?: string;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §4.3 */
export abstract class AbstractOntoMap<const SA extends ISyntacticArgument = ISyntacticArgument>
  implements IOntoMap<SA> {
  readonly ownedCommentIds: ReadonlyArray<string> = [];
  readonly ownedElementIds: ReadonlyArray<string> = [];
  readonly ownerId: string | undefined = undefined;
  allOwnedElements(): ReadonlyArray<string> { return this.ownedElementIds; }
  mustBeOwned(): boolean { return false; }
  abstract readonly id: string;
  abstract readonly module: IOntolexModule<typeof OntolexModuleRegistry.Synsem>;
  abstract readonly subjOfProp?: SA;
  abstract readonly objOfProp?: SA;
  abstract readonly propertyDomain?: SA;
  abstract readonly propertyRange?: SA;
  abstract readonly submap: ReadonlyArray<IOntoMap<SA>>;
  abstract readonly condition?: string;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §4.3 — concrete OntoMap */
export class OntoMap extends AbstractOntoMap<ISyntacticArgument> {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Synsem>;
  readonly subjOfProp?: ISyntacticArgument;
  readonly objOfProp?: ISyntacticArgument;
  readonly propertyDomain?: ISyntacticArgument;
  readonly propertyRange?: ISyntacticArgument;
  readonly submap: ReadonlyArray<IOntoMap<ISyntacticArgument>>;
  readonly condition?: string;
  constructor(data: {
    id: string;
    subjOfProp?: ISyntacticArgument;
    objOfProp?: ISyntacticArgument;
    propertyDomain?: ISyntacticArgument;
    propertyRange?: ISyntacticArgument;
    submap?: ReadonlyArray<IOntoMap<ISyntacticArgument>>;
    condition?: string;
  }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Synsem, brand: 'ontolex.Module' } as const;
    this.subjOfProp = data.subjOfProp;
    this.objOfProp = data.objOfProp;
    this.propertyDomain = data.propertyDomain;
    this.propertyRange = data.propertyRange;
    this.submap = data.submap ?? [];
    this.condition = data.condition;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DECOMP MODULE (`decomp`) — § Final CG Report §5
// http://www.w3.org/ns/lemon/decomp#
// ═══════════════════════════════════════════════════════════════════════════

// --- 12. IComponent (§5.1) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §5.1
 * @metaclass concrete
 * @generalization IElement (UML)
 * @definition A class representing a component of a multiword lexical entry
 *   (e.g., one of the words within a multiword expression). A Component is
 *   an indirection between a multiword LexicalEntry and the LexicalEntry
 *   that occupies one of its constituent positions.
 * @associationEnds
 *   correspondsTo : LexicalEntry | SyntacticArgument [0..1] -- the lexical
 *     entry (or syntactic argument) this component corresponds to
 *   subterm : LexicalEntry [0..*] -- the lexical entries that occur as a
 *     subterm of this component
 *   constituent : Component | LexicalEntry [*] -- nested constituents
 */
export interface IComponent<
    LE extends ILexicalEntry<any, any, any, any, any> = ILexicalEntry<any, any, any, any, any>>
  extends IElement {
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Decomp>;
  readonly correspondsTo?: LE;
  readonly subterm: ReadonlyArray<LE>;
  readonly constituent: ReadonlyArray<IComponent<LE> | LE>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §5.1 */
export abstract class AbstractComponent<
    const LE extends ILexicalEntry<any, any, any, any, any> = ILexicalEntry<any, any, any, any, any>>
  implements IComponent<LE> {
  readonly ownedCommentIds: ReadonlyArray<string> = [];
  readonly ownedElementIds: ReadonlyArray<string> = [];
  readonly ownerId: string | undefined = undefined;
  allOwnedElements(): ReadonlyArray<string> { return this.ownedElementIds; }
  mustBeOwned(): boolean { return false; }
  abstract readonly id: string;
  abstract readonly module: IOntolexModule<typeof OntolexModuleRegistry.Decomp>;
  abstract readonly correspondsTo?: LE;
  abstract readonly subterm: ReadonlyArray<LE>;
  abstract readonly constituent: ReadonlyArray<IComponent<LE> | LE>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §5.1 — concrete Component */
export class Component extends AbstractComponent<ILexicalEntry<any, any, any, any, any>> {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Decomp>;
  readonly correspondsTo?: ILexicalEntry<any, any, any, any, any>;
  readonly subterm: ReadonlyArray<ILexicalEntry<any, any, any, any, any>>;
  readonly constituent: ReadonlyArray<IComponent<ILexicalEntry<any, any, any, any, any>> | ILexicalEntry<any, any, any, any, any>>;
  constructor(data: {
    id: string;
    correspondsTo?: ILexicalEntry<any, any, any, any, any>;
    subterm?: ReadonlyArray<ILexicalEntry<any, any, any, any, any>>;
    constituent?: ReadonlyArray<IComponent<ILexicalEntry<any, any, any, any, any>> | ILexicalEntry<any, any, any, any, any>>;
  }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Decomp, brand: 'ontolex.Module' } as const;
    this.correspondsTo = data.correspondsTo;
    this.subterm = data.subterm ?? [];
    this.constituent = data.constituent ?? [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VARTRANS MODULE (`vartrans`) — § Final CG Report §6
// http://www.w3.org/ns/lemon/vartrans#
// ═══════════════════════════════════════════════════════════════════════════

// --- 13. ILexicoSemanticRelation (§6.1) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §6.1
 * @metaclass abstract
 * @generalization IElement (UML)
 * @definition Abstract supertype of all lexico-semantic relations
 *   (LexicalRelation, SenseRelation, ConceptualRelation,
 *   TerminologicalRelation). A relation has a source, a target, and a
 *   category that classifies the relation kind.
 * @associationEnds
 *   source : rdfs:Resource [1..*] -- the source(s) of the relation
 *   target : rdfs:Resource [1..*] -- the target(s) of the relation
 *   category : rdfs:Resource [0..1] -- the relation kind (e.g., a SKOS
 *              concept naming the relation type)
 */
export interface ILexicoSemanticRelation extends IElement {
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Vartrans>;
  readonly source: ReadonlyArray<string>;
  readonly target: ReadonlyArray<string>;
  readonly category?: string;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §6.1 */
export abstract class AbstractLexicoSemanticRelation implements ILexicoSemanticRelation {
  readonly ownedCommentIds: ReadonlyArray<string> = [];
  readonly ownedElementIds: ReadonlyArray<string> = [];
  readonly ownerId: string | undefined = undefined;
  allOwnedElements(): ReadonlyArray<string> { return this.ownedElementIds; }
  mustBeOwned(): boolean { return false; }
  abstract readonly id: string;
  abstract readonly module: IOntolexModule<typeof OntolexModuleRegistry.Vartrans>;
  abstract readonly source: ReadonlyArray<string>;
  abstract readonly target: ReadonlyArray<string>;
  abstract readonly category?: string;
}

// --- 14. ILexicalRelation (§6.2) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §6.2
 * @metaclass concrete
 * @generalization ILexicoSemanticRelation
 * @definition A lexical relation between LexicalEntries (e.g., between
 *   morphological variants of a word). Source and target must be
 *   LexicalEntries.
 */
export interface ILexicalRelation extends ILexicoSemanticRelation {}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §6.2 */
export abstract class AbstractLexicalRelation
  extends AbstractLexicoSemanticRelation
  implements ILexicalRelation {}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §6.2 — concrete LexicalRelation */
export class LexicalRelation extends AbstractLexicalRelation {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Vartrans>;
  readonly source: ReadonlyArray<string>;
  readonly target: ReadonlyArray<string>;
  readonly category?: string;
  constructor(data: { id: string; source: ReadonlyArray<string>; target: ReadonlyArray<string>; category?: string }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Vartrans, brand: 'ontolex.Module' } as const;
    this.source = data.source;
    this.target = data.target;
    this.category = data.category;
  }
}

// --- 15. ISenseRelation (§6.3) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §6.3
 * @metaclass concrete
 * @generalization ILexicoSemanticRelation
 * @definition A relation between LexicalSenses (e.g., synonymy, antonymy
 *   between two senses).
 */
export interface ISenseRelation extends ILexicoSemanticRelation {}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §6.3 */
export abstract class AbstractSenseRelation
  extends AbstractLexicoSemanticRelation
  implements ISenseRelation {}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §6.3 — concrete SenseRelation */
export class SenseRelation extends AbstractSenseRelation {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Vartrans>;
  readonly source: ReadonlyArray<string>;
  readonly target: ReadonlyArray<string>;
  readonly category?: string;
  constructor(data: { id: string; source: ReadonlyArray<string>; target: ReadonlyArray<string>; category?: string }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Vartrans, brand: 'ontolex.Module' } as const;
    this.source = data.source;
    this.target = data.target;
    this.category = data.category;
  }
}

// --- 16. IConceptualRelation (§6.4) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §6.4
 * @metaclass concrete
 * @generalization ILexicoSemanticRelation
 * @definition A relation between LexicalConcepts (e.g., a hyperonymy or
 *   meronymy relation between two cognitive concepts).
 */
export interface IConceptualRelation extends ILexicoSemanticRelation {}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §6.4 */
export abstract class AbstractConceptualRelation
  extends AbstractLexicoSemanticRelation
  implements IConceptualRelation {}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §6.4 — concrete ConceptualRelation */
export class ConceptualRelation extends AbstractConceptualRelation {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Vartrans>;
  readonly source: ReadonlyArray<string>;
  readonly target: ReadonlyArray<string>;
  readonly category?: string;
  constructor(data: { id: string; source: ReadonlyArray<string>; target: ReadonlyArray<string>; category?: string }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Vartrans, brand: 'ontolex.Module' } as const;
    this.source = data.source;
    this.target = data.target;
    this.category = data.category;
  }
}

// --- 17. ITerminologicalRelation (§6.5) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §6.5
 * @metaclass concrete
 * @generalization ILexicoSemanticRelation
 * @definition A relation between terminological units (terms typically
 *   carried by LexicalEntries within a controlled domain vocabulary).
 */
export interface ITerminologicalRelation extends ILexicoSemanticRelation {}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §6.5 */
export abstract class AbstractTerminologicalRelation
  extends AbstractLexicoSemanticRelation
  implements ITerminologicalRelation {}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §6.5 — concrete TerminologicalRelation */
export class TerminologicalRelation extends AbstractTerminologicalRelation {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Vartrans>;
  readonly source: ReadonlyArray<string>;
  readonly target: ReadonlyArray<string>;
  readonly category?: string;
  constructor(data: { id: string; source: ReadonlyArray<string>; target: ReadonlyArray<string>; category?: string }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Vartrans, brand: 'ontolex.Module' } as const;
    this.source = data.source;
    this.target = data.target;
    this.category = data.category;
  }
}

// --- 18. ITranslation (§6.6) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §6.6
 * @metaclass concrete
 * @generalization ISenseRelation
 * @definition A SenseRelation that connects two LexicalSenses across
 *   languages — that is, a translation between word-senses in different
 *   languages. Source and target must be LexicalSenses.
 */
export interface ITranslation extends ISenseRelation {}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §6.6 */
export abstract class AbstractTranslation
  extends AbstractSenseRelation
  implements ITranslation {}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §6.6 — concrete Translation */
export class Translation extends AbstractTranslation {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Vartrans>;
  readonly source: ReadonlyArray<string>;
  readonly target: ReadonlyArray<string>;
  readonly category?: string;
  constructor(data: { id: string; source: ReadonlyArray<string>; target: ReadonlyArray<string>; category?: string }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Vartrans, brand: 'ontolex.Module' } as const;
    this.source = data.source;
    this.target = data.target;
    this.category = data.category;
  }
}

// --- 19. ITranslationSet (§6.7) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §6.7
 * @metaclass concrete
 * @generalization IElement (UML)
 * @definition A set of Translations grouped together (e.g., all
 *   translations for a particular bilingual dictionary entry).
 * @associationEnds
 *   trans : Translation [*] -- the translations belonging to this set
 */
export interface ITranslationSet<T extends ITranslation = ITranslation> extends IElement {
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Vartrans>;
  readonly trans: ReadonlyArray<T>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §6.7 */
export abstract class AbstractTranslationSet<const T extends ITranslation = ITranslation>
  implements ITranslationSet<T> {
  readonly ownedCommentIds: ReadonlyArray<string> = [];
  readonly ownedElementIds: ReadonlyArray<string> = [];
  readonly ownerId: string | undefined = undefined;
  allOwnedElements(): ReadonlyArray<string> { return this.ownedElementIds; }
  mustBeOwned(): boolean { return false; }
  abstract readonly id: string;
  abstract readonly module: IOntolexModule<typeof OntolexModuleRegistry.Vartrans>;
  abstract readonly trans: ReadonlyArray<T>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §6.7 — concrete TranslationSet */
export class TranslationSet extends AbstractTranslationSet<ITranslation> {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Vartrans>;
  readonly trans: ReadonlyArray<ITranslation>;
  constructor(data: { id: string; trans?: ReadonlyArray<ITranslation> }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Vartrans, brand: 'ontolex.Module' } as const;
    this.trans = data.trans ?? [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LIME MODULE (`lime`) — § Final CG Report §7
// http://www.w3.org/ns/lemon/lime#
// ═══════════════════════════════════════════════════════════════════════════

// --- 20. ILexicon (§7.1) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §7.1
 * @metaclass concrete
 * @generalization IElement (UML), IMofObject (MOF reflective protocol)
 * @definition A Lexicon represents an aggregation of one or more lexical
 *   entries that share the same language (and possibly a common subject
 *   domain). The Lexicon also carries the language tag and counts of
 *   entries / references / linguistic-catalog references.
 * @ownedAttributes
 *   language : String [1] -- ISO 639-3 (or BCP-47) language tag of the entries
 *   lexicalEntries : Integer [0..1] -- number of LexicalEntries in this Lexicon
 *   references : Integer [0..1] -- number of distinct references reached from
 *                this Lexicon's senses
 *   linguisticCatalog : String [0..*] -- IRIs of catalogs (e.g., LexInfo)
 *                       that this Lexicon adheres to
 * @associationEnds
 *   entry : LexicalEntry [*] -- the entries contained in this Lexicon
 */
export interface ILexicon<
    LE extends ILexicalEntry<any, any, any, any, any> = ILexicalEntry<any, any, any, any, any>>
  extends IElement {
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Lime>;
  readonly language: string;
  readonly entry: ReadonlyArray<LE>;
  readonly lexicalEntries?: number;
  readonly references?: number;
  readonly linguisticCatalog: ReadonlyArray<string>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §7.1 */
export abstract class AbstractLexicon<
    const LE extends ILexicalEntry<any, any, any, any, any> = ILexicalEntry<any, any, any, any, any>>
  implements ILexicon<LE> {
  readonly ownedCommentIds: ReadonlyArray<string> = [];
  readonly ownedElementIds: ReadonlyArray<string> = [];
  readonly ownerId: string | undefined = undefined;
  allOwnedElements(): ReadonlyArray<string> { return this.ownedElementIds; }
  mustBeOwned(): boolean { return false; }
  abstract readonly id: string;
  abstract readonly module: IOntolexModule<typeof OntolexModuleRegistry.Lime>;
  abstract readonly language: string;
  abstract readonly entry: ReadonlyArray<LE>;
  abstract readonly lexicalEntries?: number;
  abstract readonly references?: number;
  abstract readonly linguisticCatalog: ReadonlyArray<string>;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §7.1 — concrete Lexicon */
export class Lexicon extends AbstractLexicon<ILexicalEntry<any, any, any, any, any>> {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Lime>;
  readonly language: string;
  readonly entry: ReadonlyArray<ILexicalEntry<any, any, any, any, any>>;
  readonly lexicalEntries?: number;
  readonly references?: number;
  readonly linguisticCatalog: ReadonlyArray<string>;
  constructor(data: {
    id: string;
    language: string;
    entry?: ReadonlyArray<ILexicalEntry<any, any, any, any, any>>;
    lexicalEntries?: number;
    references?: number;
    linguisticCatalog?: ReadonlyArray<string>;
  }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Lime, brand: 'ontolex.Module' } as const;
    this.language = data.language;
    this.entry = data.entry ?? [];
    this.lexicalEntries = data.lexicalEntries;
    this.references = data.references;
    this.linguisticCatalog = data.linguisticCatalog ?? [];
  }
}

// --- 21. ILexicalLinkset (§7.2) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §7.2
 * @metaclass concrete
 * @generalization IElement (UML)
 * @definition A LexicalLinkset is a description of an RDF dataset whose
 *   triples consist of links between LexicalEntries (or between Lexicons).
 *   It carries metrics such as the number of links and the percentage of
 *   the source / target lexicons that are linked.
 * @ownedAttributes
 *   links : Integer [0..1] -- the number of links in the linkset
 *   percentage : Real [0..1] -- the percentage of source entries that are
 *                linked
 *   avgNumOfLinks : Real [0..1] -- average number of links per source entry
 */
export interface ILexicalLinkset extends IElement {
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Lime>;
  readonly links?: number;
  readonly percentage?: number;
  readonly avgNumOfLinks?: number;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §7.2 */
export abstract class AbstractLexicalLinkset implements ILexicalLinkset {
  readonly ownedCommentIds: ReadonlyArray<string> = [];
  readonly ownedElementIds: ReadonlyArray<string> = [];
  readonly ownerId: string | undefined = undefined;
  allOwnedElements(): ReadonlyArray<string> { return this.ownedElementIds; }
  mustBeOwned(): boolean { return false; }
  abstract readonly id: string;
  abstract readonly module: IOntolexModule<typeof OntolexModuleRegistry.Lime>;
  abstract readonly links?: number;
  abstract readonly percentage?: number;
  abstract readonly avgNumOfLinks?: number;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §7.2 — concrete LexicalLinkset */
export class LexicalLinkset extends AbstractLexicalLinkset {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Lime>;
  readonly links?: number;
  readonly percentage?: number;
  readonly avgNumOfLinks?: number;
  constructor(data: { id: string; links?: number; percentage?: number; avgNumOfLinks?: number }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Lime, brand: 'ontolex.Module' } as const;
    this.links = data.links;
    this.percentage = data.percentage;
    this.avgNumOfLinks = data.avgNumOfLinks;
  }
}

// --- 22. ILexicalizationSet (§7.3) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §7.3
 * @metaclass concrete
 * @generalization IElement (UML)
 * @definition A LexicalizationSet is a description of an RDF dataset that
 *   provides lexicalizations for an ontology (a set of LexicalEntries that
 *   point at the ontology's classes/properties). It carries statistics such
 *   as the number of lexicalizations, the number of references, and
 *   ambiguity / synonymy averages.
 * @ownedAttributes
 *   lexicalizations : Integer [0..1] -- number of lexicalization triples
 *   references : Integer [0..1] -- number of distinct ontology references
 *                lexicalized
 *   avgAmbiguity : Real [0..1] -- average number of senses per LexicalEntry
 *   avgSynonymy : Real [0..1] -- average number of LexicalEntries per
 *                 reference
 *   percentage : Real [0..1] -- percentage of ontology covered
 *   avgNumOfLexicalizations : Real [0..1]
 *   lexicalizationModel : String [0..1] -- the lexicalization model URI
 *                         (e.g., the OntoLex Core URI for OntoLex-conformant
 *                         lexicalizations)
 *   conceptualizations : Integer [0..1]
 */
export interface ILexicalizationSet extends IElement {
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Lime>;
  readonly lexicalizations?: number;
  readonly references?: number;
  readonly avgAmbiguity?: number;
  readonly avgSynonymy?: number;
  readonly percentage?: number;
  readonly avgNumOfLexicalizations?: number;
  readonly lexicalizationModel?: string;
  readonly conceptualizations?: number;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §7.3 */
export abstract class AbstractLexicalizationSet implements ILexicalizationSet {
  readonly ownedCommentIds: ReadonlyArray<string> = [];
  readonly ownedElementIds: ReadonlyArray<string> = [];
  readonly ownerId: string | undefined = undefined;
  allOwnedElements(): ReadonlyArray<string> { return this.ownedElementIds; }
  mustBeOwned(): boolean { return false; }
  abstract readonly id: string;
  abstract readonly module: IOntolexModule<typeof OntolexModuleRegistry.Lime>;
  abstract readonly lexicalizations?: number;
  abstract readonly references?: number;
  abstract readonly avgAmbiguity?: number;
  abstract readonly avgSynonymy?: number;
  abstract readonly percentage?: number;
  abstract readonly avgNumOfLexicalizations?: number;
  abstract readonly lexicalizationModel?: string;
  abstract readonly conceptualizations?: number;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §7.3 — concrete LexicalizationSet */
export class LexicalizationSet extends AbstractLexicalizationSet {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Lime>;
  readonly lexicalizations?: number;
  readonly references?: number;
  readonly avgAmbiguity?: number;
  readonly avgSynonymy?: number;
  readonly percentage?: number;
  readonly avgNumOfLexicalizations?: number;
  readonly lexicalizationModel?: string;
  readonly conceptualizations?: number;
  constructor(data: {
    id: string;
    lexicalizations?: number;
    references?: number;
    avgAmbiguity?: number;
    avgSynonymy?: number;
    percentage?: number;
    avgNumOfLexicalizations?: number;
    lexicalizationModel?: string;
    conceptualizations?: number;
  }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Lime, brand: 'ontolex.Module' } as const;
    this.lexicalizations = data.lexicalizations;
    this.references = data.references;
    this.avgAmbiguity = data.avgAmbiguity;
    this.avgSynonymy = data.avgSynonymy;
    this.percentage = data.percentage;
    this.avgNumOfLexicalizations = data.avgNumOfLexicalizations;
    this.lexicalizationModel = data.lexicalizationModel;
    this.conceptualizations = data.conceptualizations;
  }
}

// --- 23. IConceptualizationSet (§7.4) ---
/**
 * @standard W3C OntoLex-Lemon Final CG Report 2016-05-10
 * @section §7.4
 * @metaclass concrete
 * @generalization IElement (UML)
 * @definition A ConceptualizationSet is a description of an RDF dataset
 *   that connects LexicalConcepts to ontology entities. Its statistics
 *   include the number of conceptualizations and the number of concepts.
 * @ownedAttributes
 *   conceptualizations : Integer [0..1] -- number of conceptualization triples
 *   concepts : Integer [0..1] -- number of distinct concepts
 *   references : Integer [0..1] -- number of distinct references
 */
export interface IConceptualizationSet extends IElement {
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Lime>;
  readonly conceptualizations?: number;
  readonly concepts?: number;
  readonly references?: number;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §7.4 */
export abstract class AbstractConceptualizationSet implements IConceptualizationSet {
  readonly ownedCommentIds: ReadonlyArray<string> = [];
  readonly ownedElementIds: ReadonlyArray<string> = [];
  readonly ownerId: string | undefined = undefined;
  allOwnedElements(): ReadonlyArray<string> { return this.ownedElementIds; }
  mustBeOwned(): boolean { return false; }
  abstract readonly id: string;
  abstract readonly module: IOntolexModule<typeof OntolexModuleRegistry.Lime>;
  abstract readonly conceptualizations?: number;
  abstract readonly concepts?: number;
  abstract readonly references?: number;
}

/** @standard W3C OntoLex-Lemon Final CG Report 2016-05-10 §7.4 — concrete ConceptualizationSet */
export class ConceptualizationSet extends AbstractConceptualizationSet {
  readonly id: string;
  readonly module: IOntolexModule<typeof OntolexModuleRegistry.Lime>;
  readonly conceptualizations?: number;
  readonly concepts?: number;
  readonly references?: number;
  constructor(data: { id: string; conceptualizations?: number; concepts?: number; references?: number }) {
    super();
    this.id = data.id;
    this.module = { token: OntolexModuleRegistry.Lime, brand: 'ontolex.Module' } as const;
    this.conceptualizations = data.conceptualizations;
    this.concepts = data.concepts;
    this.references = data.references;
  }
}

// END OF SPEC-DRIVEN METACLASS DECLARATIONS — every OWL class declared in
// the five OntoLex-Lemon Final CG Report 2016-05-10 modular vocabularies is
// now expressed as a Three-Layer Pattern (interface + abstract + concrete).
