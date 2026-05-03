# @amlhubs/ontolex — W3C OntoLex-Lemon as a Typed Metamodel

## Identity

| Field | Value |
|---|---|
| Standard | W3C OntoLex-Lemon — Lexicon Model for Ontologies |
| W3C Final CG Report | [10 May 2016](https://www.w3.org/2016/05/ontolex/) |
| W3C URL | [w3.org/2016/05/ontolex](https://www.w3.org/2016/05/ontolex/) |
| Authority | [W3C Ontology-Lexicon Community Group](https://www.w3.org/community/ontolex/) under [W3C Community Final Specification Agreement](https://www.w3.org/community/about/agreements/final/) |
| Adoption Status | W3C Community Final Specification — published under FSA license. The Final Community Group Report is a stable, archived publication; not a W3C Recommendation (no chartered Working Group exists for OntoLex). |
| ISO Adoption | None — OntoLex is governed exclusively by the W3C Ontology-Lexicon Community Group. Cross-spec compatibility with [ISO 24613 LMF](https://www.iso.org/standard/85109.html) is documented in §C-CRIT-01 of the AML deep-research record. |
| npm Package | `@amlhubs/ontolex` |
| npm Version | `0.0.1` |
| Peer Dependencies | [`@amlhubs/uml`](https://github.com/amlhubs/uml) `^0.0.2`, [`@amlhubs/mof`](https://github.com/amlhubs/mof) `^0.0.2`, [`@amlhubs/sbvr`](https://github.com/amlhubs/sbvr) `^0.0.1` |
| License | MIT |

## Abstract

The W3C OntoLex-Lemon Final Community Group Report ([10 May 2016](https://www.w3.org/2016/05/ontolex/)) specifies a modular OWL/RDFS vocabulary that binds a lexical entry — a word, multiword expression, or affix — to the ontology concept(s) it denotes. Where the [SBVR](https://www.omg.org/spec/SBVR/1.5/) metamodel models *natural-language vocabularies and rules about a domain*, OntoLex models *the lexicon that grounds those vocabularies in an ontology*: a `LexicalEntry` carries one or more `Form` instances (orthographic surfaces with `writtenRep`) and one or more `LexicalSense` instances; each Sense `denotes` (or `references`) an ontology concept that, in the OntoLex view, is an OWL class. Five modular vocabularies — Core (`ontolex`), Syntax-Semantics (`synsem`), Decomposition (`decomp`), Variation/Translation (`vartrans`), and Linguistic Metadata (`lime`) — partition the surface so that consumers can adopt only the modules their use case requires.

The `@amlhubs/ontolex` npm package surfaces every OWL class declared in the five Final-CG-Report 2016-05-10 modular vocabularies as a TypeScript Layer 1 interface (`IFoo`), Layer 2 abstract class (`AbstractFoo<const T>`), and Layer 3 concrete class (`FooInstance` with bound type arguments). Every declaration carries a JSDoc header citing `@standard W3C OntoLex-Lemon Final CG Report 2016-05-10` together with the precise `@section §x.y` anchor in the report. The package is the binding-to-ontology layer of the AML metamodel stack — sitting on top of [`@amlhubs/uml`](https://github.com/amlhubs/uml) (structural metaclasses), [`@amlhubs/mof`](https://github.com/amlhubs/mof) (reflective protocol), and [`@amlhubs/sbvr`](https://github.com/amlhubs/sbvr) (linguistic-rule surface), and emitted as a peer dependency so consumers can pin OntoLex versions independently from the upstream metamodels.

## Business Value — Why Extending This Metamodel Pays Off

OntoLex is the only widely-deployed open-standard vocabulary that systematically separates the *lexical entry* (a word as a linguistic object) from the *sense* (the cognitive mediator that connects the word to the world) from the *reference* (the ontology concept the word picks out in the world). Every multilingual product, every search-engine query parser, every entity-linking system, every term-extraction pipeline, every translation memory, and every chatbot intent classifier silently re-implements this three-way separation when it ships — typically as a bespoke triple of `(string, gloss, schema_class_id)`. Adopting OntoLex collapses that bespoke surface to one OMG-grade vocabulary and immediately lets any AML-graph consumer reuse linked-data corpora ([DBnary](http://kaiko.getalp.org/about-dbnary/), [BabelNet](https://babelnet.org/), [Apertium dictionaries](https://www.apertium.org/), the entire [Linguistic Linked Open Data Cloud](https://linguistic-lod.org/)) which are already published in OntoLex-Lemon turtles. Re-implementing those datasets in a private vocabulary is a multi-quarter integration effort the OntoLex package erases on `npm install`.

The ontology-binding pipeline is the load-bearing architectural claim of this package. OntoLex `Reference` (Final CG Report §3.5) is the property that connects a `LexicalSense` to an OWL class, an SBVR `IObjectType`, or any RDF resource carrying a `rdfs:Class` typing — which means a chatbot's user input ("I want a refund") can be tokenized to surface `Form`s, those `Form`s can be looked up as `LexicalEntry`s, the entries' `LexicalSense`s can be projected through `Reference` to land on `IRefundCommand` (an SBVR Object Type registered against an `@agenihub/aml`-typed UML Class), and the SBVR formulation algebra can fire the `Refund.AcceptIfWithinPolicy` rule end-to-end. Every step in that chain is type-checked at compile time. The hallucination surface that LLMs would otherwise introduce by inventing surface-form mappings collapses to `tsc` errors that trace to specific §-sections of the OntoLex Final Report.

The third lever is the LLOD-grade interoperability surface. OntoLex is the lingua franca of the [Linguistic Linked Open Data](https://linguistic-lod.org/llod-cloud) ecosystem; an [@amlhubs/ontolex](https://github.com/amlhubs/ontolex)-typed `Lexicon` can be serialized to TTL, loaded into a triple store, and queried with SPARQL alongside any other LLOD dataset. The reverse is equally important: the 23M-entry [BabelNet](https://babelnet.org/) graph (commercial, OntoLex-grounded) and the open [DBnary](http://kaiko.getalp.org/) Wiktionary export (CC-BY-SA, OntoLex-grounded) both ship native OntoLex turtles that an `@amlhubs/ontolex` consumer can ingest directly — no schema-translation layer required. Ventures building multilingual SaaS (every B2B that operates in more than one country) immediately gain a vocabulary-sharing surface against the rest of the OntoLex ecosystem.

The fourth lever is the modular-adoption discipline. The Final CG Report is intentionally partitioned into five modules — Core, SynSem, Decomp, Vartrans, Lime — so that a consumer that only needs surface-form-to-ontology binding (Core + Lime) does not pay the conceptual cost of syntactic-frame modeling (SynSem) or translation-set management (Vartrans). The package mirrors that modular structure: every concrete class declares which module it belongs to via a branded `IOntolexModule` token, so a static analyser can prune unused modules from a consumer's dependency graph at build time.

The fifth lever is composability across the ageni metamodel stack. [`@amlhubs/uml`](https://github.com/amlhubs/uml) provides the 45 structural metaclasses every OntoLex Element roots in; [`@amlhubs/mof`](https://github.com/amlhubs/mof) provides the reflective protocol for serialization round-trips; [`@amlhubs/sbvr`](https://github.com/amlhubs/sbvr) provides the noun-concept and rule surface that an OntoLex `Reference` can land on. The OntoLex package is therefore the lexicon-facing entry point into the same metamodel substrate that every ageni-generated venture already consumes. A `lesvolsarabais.ca` flight-deal description, a `dealsempire` product pitch, an `illummaa.com` modular-home spec sheet, and a Quebec-French legal-document template are all `LexicalEntry`s pointing to SBVR-typed `IObjectType`s in their respective domain ontologies — typed against the same vocabulary, exchanged in the same TTL serialization, and indexable by the same SPARQL-grade queries that the rest of the LLOD cloud uses.

## Scope — What the Package Surfaces

The package surfaces every OWL class declared in the five Final-CG-Report 2016-05-10 modular vocabularies. The complete enumeration of interfaces, abstract classes, and concrete classes lives in [`src/ontolex.ts`](./src/ontolex.ts).

| OntoLex Module | RDF Namespace | §Section | Key Metaclasses Surfaced |
|---|---|---|---|
| Core (`ontolex`) | `http://www.w3.org/ns/lemon/ontolex#` | §3 | `ILexicalEntry`, `IWord`, `IMultiwordExpression`, `IAffix`, `IForm`, `ILexicalSense`, `ILexicalConcept`, `IReference`, `ILexicalForm` |
| SynSem (`synsem`) | `http://www.w3.org/ns/lemon/synsem#` | §4 | `ISyntacticFrame`, `ISyntacticArgument`, `ISyntacticRoleMarker` |
| Decomp (`decomp`) | `http://www.w3.org/ns/lemon/decomp#` | §5 | `IComponent`, `IComponentList`, `IConstituentList`, `IConstituent` |
| Vartrans (`vartrans`) | `http://www.w3.org/ns/lemon/vartrans#` | §6 | `ILexicalRelation`, `ISenseRelation`, `ITranslation`, `ITranslationSet` |
| Lime (`lime`) | `http://www.w3.org/ns/lemon/lime#` | §7 | `ILexicon`, `ILexicalLinkset`, `IConceptSet` |

Every interface carries a JSDoc header of the form `@standard W3C OntoLex-Lemon Final CG Report 2016-05-10`, `@section §x.y`, and `@generalization IParent`. Concrete classes follow the `I{Name}` / `Abstract{Name}` / `{Name}{Instance}` Three-Layer Pattern per [.claude/rules/convention/abstract-class.md](https://github.com/agenihub/master/blob/main/.claude/rules/convention/abstract-class.md).

## Cross-Spec Note: OntoLex `LexicalEntry` ≠ LMF `LexicalEntry` ≠ TEI `<entry>`

A `LexicalEntry` in OntoLex-Lemon is an OWL class whose `canonicalForm` is mandatory and whose `lexicalForm` may be a `Word`, `MultiwordExpression`, or `Affix`. In ISO 24613 LMF (2024) the same name designates a UML-typed metaclass with mandatory `Form` and optional `Sense` aggregations and richer morphological structure. In TEI P5 `<entry>` is an XML element with `<form>` and `<sense>` children using a different attribute schema. In [DBnary](http://kaiko.getalp.org/about-dbnary/) (an OntoLex-grounded Wiktionary export) the OntoLex `lemon:LexicalEntry` is augmented with `dbnary:*` properties.

This package registers OntoLex concepts under the `@amlhubs/ontolex` namespace and stays silent on cross-spec consensus. A separate downstream `lexical-entry-consensus` package (out of scope for this release) is the appropriate vehicle for unifying the four vocabularies under their semantic intersection. The CMOF `PackageMerge` mechanism is the recommended UML-native vehicle when consensus modeling becomes warranted; AML's `mof` peer dependency already exposes `IPackageMerge`.

The same rule applies to the overlap with [`.claude/rules/linguistical/linguistical.md`](https://github.com/agenihub/master/blob/main/.claude/rules/linguistical/linguistical.md), which defines a `Form`/`LexicalEntry`/`Lexeme`/`Lemma`/`Word`/`Morpheme` vocabulary at the AML linguistical layer. OntoLex sits *on top of* that vocabulary as the binding-to-ontology surface — citing both is correct; identifying the two is not.

## Dependency Topology

```
@amlhubs/uml  (structural metaclasses — root of the OMG stack)
      ▲                                          ▲
      │ peerDependency (IElement)                │
      │                                          │ peerDependency
      │                @amlhubs/mof  (reflective machinery)
      │                          ▲
      │                          │ peerDependency
      │                          │
      │           @amlhubs/sbvr  (linguistic-rule surface)
      │                                ▲
      │                                │ peerDependency
      │                                │
      └──────── @amlhubs/ontolex (this package) ──────┘
```

`@amlhubs/ontolex` declares all three upstream packages as `peerDependencies` (not direct `dependencies`) so that consumers can pin upstream versions independently and so that `npm` resolves a single shared instance of each upstream metamodel across the dependency graph. This avoids the duplicate-metaclass problem that would otherwise arise from co-resolution of `@amlhubs/sbvr@x` and `@amlhubs/ontolex@y` each pulling their own `@amlhubs/uml` minor version.

## Installation & Usage

```bash
npm install @amlhubs/ontolex @amlhubs/uml @amlhubs/mof @amlhubs/sbvr
```

```typescript
import {
  OntolexModuleRegistry,
} from '@amlhubs/ontolex';

import type {
  // Core
  ILexicalEntry,
  IWord,
  IForm,
  ILexicalSense,
  IReference,
  // Lime
  ILexicon,
  // Vartrans
  ITranslation,
  // SynSem
  ISyntacticFrame,
} from '@amlhubs/ontolex';

// The registry is a frozen const-object — no enum, no string-union type.
const coreModule = OntolexModuleRegistry.Ontolex;
// → 'http://www.w3.org/ns/lemon/ontolex#'
```

The source artifact is [`src/ontolex.ts`](./src/ontolex.ts). Every interface JSDoc header declares `@standard W3C OntoLex-Lemon Final CG Report 2016-05-10` and the `@section §x.y` reference for its defining clause.

## Provenance & Formal References

- [W3C OntoLex-Lemon Final Community Group Report (10 May 2016)](https://www.w3.org/2016/05/ontolex/) — the authoritative spec
- [OntoLex Lexicography Module Final Report (Sept 2019)](https://www.w3.org/2019/09/lexicog/) — out of scope for this `0.0.1` release
- [OntoLex Morphology Module Final Report](https://ontolex.github.io/morph/) — out of scope for this `0.0.1` release
- [W3C Ontology-Lexicon Community Group](https://www.w3.org/community/ontolex/) — governance
- [Linguistic Linked Open Data Cloud](https://linguistic-lod.org/) — adoption baseline
- [DBnary — OntoLex-grounded Wiktionary export](http://kaiko.getalp.org/about-dbnary/) — reference dataset
- [BabelNet — OntoLex-grounded multilingual semantic network](https://babelnet.org/)
- [W3C Community Final Specification Agreement (FSA)](https://www.w3.org/community/about/agreements/final/) — license
- Upstream UML foundation: [`@amlhubs/uml`](https://github.com/amlhubs/uml)
- Upstream MOF reflective machinery: [`@amlhubs/mof`](https://github.com/amlhubs/mof)
- Upstream SBVR linguistic-rule surface: [`@amlhubs/sbvr`](https://github.com/amlhubs/sbvr)

## Version History

- `0.0.1` (2026-05-03) — initial release. Skeleton + module registry + JSDoc-cited Core/SynSem/Decomp/Vartrans/Lime metaclasses inserted by the AML metamodel deploy pipeline.
