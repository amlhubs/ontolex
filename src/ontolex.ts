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
// @ontolex-coverage: Core (LexicalEntry, Word, MultiwordExpression, Affix,
//   Form, LexicalSense, LexicalConcept, Reference, LexicalForm), SynSem
//   (SyntacticFrame, SyntacticArgument, SyntacticRoleMarker), Decomp
//   (Component, ComponentList, ConstituentList, Constituent), Vartrans
//   (LexicalRelation, SenseRelation, Translation, TranslationSet), Lime
//   (Lexicon, LexicalLinkset, ConceptSet).
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
// IMPLEMENTATION INSERTED BELOW BY SUBAGENT WAVES.
// Implementer briefs MUST insert (a) Layer 1 interfaces, (b) Layer 2 abstract
// classes, and (c) Layer 3 concrete classes per metaclass below this banner.
// Cover order:
//   1. ILexicalEntry (§3.1)
//   2. IWord (§3.1.1)
//   3. IMultiwordExpression (§3.1.2)
//   4. IAffix (§3.1.3)
//   5. IForm (§3.2)
//   6. ILexicalSense (§3.3)
//   7. ILexicalConcept (§3.4)
//   8. IReference (§3.5)
//   9. ILexicalForm (§3.2 — abstract supertype of Form)
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// SYNSEM MODULE (`synsem`) — § Final CG Report §4
// IMPLEMENTATION INSERTED BELOW BY SUBAGENT WAVES.
// Cover order: ISyntacticFrame, ISyntacticArgument, ISyntacticRoleMarker.
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// DECOMP MODULE (`decomp`) — § Final CG Report §5
// IMPLEMENTATION INSERTED BELOW BY SUBAGENT WAVES.
// Cover order: IComponent, IComponentList, IConstituentList, IConstituent.
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// VARTRANS MODULE (`vartrans`) — § Final CG Report §6
// IMPLEMENTATION INSERTED BELOW BY SUBAGENT WAVES.
// Cover order: ILexicalRelation, ISenseRelation, ITranslation, ITranslationSet.
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// LIME MODULE (`lime`) — § Final CG Report §7
// IMPLEMENTATION INSERTED BELOW BY SUBAGENT WAVES.
// Cover order: ILexicon, ILexicalLinkset, IConceptSet.
// ═══════════════════════════════════════════════════════════════════════════

// END OF SKELETON — every metaclass listed above MUST be inserted between
// the corresponding banner and the next banner by the implementation waves.
