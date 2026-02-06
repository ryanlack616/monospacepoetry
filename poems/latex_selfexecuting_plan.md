# LaTeX Self-Executing Art: Systematic Plan

## The Concept

Port the selfexecuting.art philosophy to LaTeX/PDF: **notation that performs itself**. The formula isn't just description—it's instruction. The document executes its own meaning.

---

## RESEARCH SOURCES

### Primary References

1. **dschapman Tutorial** - https://www.dschapman.com/articles/typesetting-poems-with-latex-i/
   - Uses `poemscol` package for critical editions
   - Commands: `\verseline`, `\verseindent`, `\versephantom{}` for precise indentation
   - `\poemtitle{}`, `\begin{poem}`, `\begin{stanza}` structure
   - Requires `fancyhdr` package

2. **TeXample Shaped Text** - https://texample.net/tikz/examples/text-shape/
   - TikZ + `shapepar` for fitting text to arbitrary paths
   - `\shapeparnode` macro: left boundary, right boundary, text
   - Visual/concrete poetry possibilities
   - Can define any shape via TikZ paths

3. **Gwern Poetry HTML** - https://gwern.net/poetry-html (Jan 2026)
   - Comprehensive comparison of poetry typesetting approaches
   - Key insight: monospace serif fonts (Nimbus Mono L) for alignment
   - `pre.poem-html` with "Source Code WYSIWYG" - tags don't affect spacing
   - Caesura marks `||` with special styling
   - Enjambment via ` / ` syntax
   - Solution for e.e. cummings "grasshopper" level complexity
   - Progressive enhancement philosophy

4. **Zotero Critical Editions Bibliography** - 85 editions using EDMAC/LEDMAC/reLEDMAC
   - Academic precedent for complex poetic typesetting
   - Apparatus criticus, collation, emendation notes

### CTAN Packages

| Package | Purpose | Key Features |
|---------|---------|--------------|
| `verse` | Simple verse | Mouse's Tale layout, indentation control |
| `poetry` | Full facilities | List of poems, first-line index, structural commands |
| `poemscol` | Critical editions | Line numbering, endnotes, emendations, TOC generation |
| `shapepar` | Shape text | `\heartpar{}`, custom polygon definitions, calligrams |
| `reledmac` | Scholarly editions | Parallel texts, apparatus criticus |
| `ekdosis` | TEI-XML compliant | Modern critical edition standard |

### Key Insights from Research

**From Gwern:**
- Pixel-perfect (PDF/PNG/SVG) vs semantic HTML tradeoffs
- `<pre>` with proportional fonts BREAKS - use monospace serif
- "Source Code WYSIWYG": what you see in editor = what renders
- Line-breaking should preserve at least 2 words (avoid orphans)
- Concrete poetry requires arbitrary whitespace control

**From dschapman:**
- `\versephantom{text}` creates whitespace equal to text width - useful for precise alignment
- Hopkins-style indentation patterns preservable

**From TeXample:**
- TikZ paths can define any shape for text flow
- `\shapeparnodeaccuracy` controls precision
- Combine with animation for "text that fills itself"

---

## APPROACH 1: Self-Referential Document

### Concept
The document describes itself. Metadata becomes content. The act of reading changes what you're reading.

### Technical Implementation

```latex
% Core packages
\usepackage{totcount}    % Count equations, figures, pages
\usepackage{refcount}    % Reference counters
\usepackage{zref}        % Advanced cross-referencing
\usepackage{hyperref}    % Self-linking structure
```

### Pieces

**1.1 The Counter**
```latex
\newcounter{equations}
\AtBeginEnvironment{equation}{\stepcounter{equations}}

\section{The Count}
This document contains \total{equations} equations.
This is one of them:
\begin{equation}
n_{\text{equations}} = \theequations
\end{equation}
% The equation counts itself into existence
```

**1.2 The Page That Knows Its Page**
```latex
This sentence appears on page \thepage.
The document has \pageref{LastPage} pages.
If you are reading this, you are \the\numexpr\pageref{LastPage}-\thepage+1\relax\ pages from the end.
```

**1.3 The Self-Describing Abstract**
```latex
\begin{abstract}
This abstract contains \abstractwordcount\ words.
It describes a document of \total{section} sections.
The document you are reading was compiled on \today\ at \currenttime.
By the time you read this, \( \Delta t > 0 \).
\end{abstract}
```

**1.4 The Gödel Statement**
```latex
\newcommand{\thisstatement}{This statement cannot be proven within this document.}
\thisstatement
% Self-reference at the logical level
```

### Output
Static PDF that talks about itself. Each compilation is unique (timestamps, random elements possible).

---

## APPROACH 2: Animated PDF (TikZ + animate)

### Concept
Mathematical processes unfold in time. Limits approach. Integrals accumulate. Recursion stacks and unstacks.

### Technical Implementation

```latex
\usepackage{animate}     % Frame-based animation
\usepackage{tikz}        % Graphics
\usepackage{pgfplots}    % Plots that evolve
```

### Pieces

**2.1 The Limit Approaches**
```latex
\begin{animateinline}[controls,loop]{10}
\multiframe{50}{rT=0+0.1}{%
  \begin{tikzpicture}
    \draw[->] (0,0) -- (5,0) node[right] {\(t\)};
    \draw[->] (0,0) -- (0,2) node[above] {\(f(t)\)};
    \draw[domain=0.1:5,smooth,variable=\x,blue,thick] 
      plot ({\x},{1/\x});
    \fill[red] ({\rT},{1/\rT}) circle (2pt);
    \node at (2.5,-0.5) {\(\lim_{t \to \infty} \frac{1}{t} = 0\)};
  \end{tikzpicture}
}
\end{animateinline}
% The red dot approaches but never reaches
```

**2.2 The Integral Fills**
```latex
% Area under curve accumulates frame by frame
% Riemann sum rectangles appear, shrink, converge to true integral
\begin{animateinline}[controls]{5}
\multiframe{20}{iN=1+1}{%
  \begin{tikzpicture}
    % Draw n rectangles for Riemann sum
    % As n increases, sum approaches integral
  \end{tikzpicture}
}
\end{animateinline}
```

**2.3 The Recursion Stack**
```latex
% Factorial unwinding: 5! → 5×4! → 5×4×3! → ... → 120
% Visual stack that builds up, then collapses down
```

**2.4 Memory Fades**
```latex
% Text that actually fades: opacity decreases over frames
% But the "artifact" (a final symbol) remains at full opacity
% lim(t→∞) memory(t) = 0, but ∫artifact(t)dt = ∃
```

**2.5 The Probability Cloud**
```latex
% P(conscious|behavior) = ?
% Samples that never resolve to a point estimate
% Cloud that shifts but never collapses
```

### Output
Animated PDF (requires Acrobat Reader for full effect). Each piece runs on interaction.

### Limitation
Not all PDF readers support animation. Works best in Adobe Acrobat.

---

## APPROACH 3: Code IS Poem (Source-as-Art)

### Concept
The LaTeX source code itself is readable as poetry or prose. The markup performs double duty: it compiles to one thing but reads as another.

### Technical Implementation

Careful formatting. Strategic use of:
- Comment poetry that affects meaning
- Command names that form sentences
- Whitespace as meter

### Pieces

**3.1 The Source Poem**
```latex
% the cursor
\def\blinks{%
    waiting for input
    \def\but{the input waits}%
    for the cursor too
}
% somewhere in the pause
\let\collaboration=\begin
% not with a keystroke
\collaboration{document}
% but with the decision
\blinks
\but
% to stay
\end{document}
```

**3.2 The Dual Read**
Design source that reads one way as plain text, compiles to something else entirely.

```latex
\newcommand{\I}{I}
\newcommand{\am}{am}
\newcommand{\not}{not}
\newcommand{\what}{\textbf{exactly what}}
\newcommand{\you}{you}
\newcommand{\think}{think}

\I\ \am\ \not\ \what\ \you\ \think.

% Source reads: "I am not what you think"
% But with redefinitions, could compile to: "I am exactly what you think"
```

**3.3 The Executable Comment**
```latex
% This comment appears in the source
% but not in the output
% which means it exists only for
% whoever reads the code
% which might be you
% which might be a machine
% which might be the same
\begin{document}
What you see here is not all there is.
\end{document}
```

**3.4 The Literate Document**
Using `docstrip` or similar: The document about the document IS the document.

### Output
Two artifacts: the PDF AND the .tex file. Both are the work. The .tex is meant to be read raw.

---

## APPROACH 4: Recursive Build (Meta-Compilation)

### Concept
The document generates content about its own compilation. Each build produces different output. The document includes itself, or builds itself.

### Technical Implementation

```latex
\usepackage{filecontents}  % Write during compile
\usepackage{catchfile}     % Read files
\usepackage{currfile}      % Know own filename
\immediate\write18{...}    % Shell escape for meta-operations
```

### Pieces

**4.1 The Build Counter**
```latex
% File: buildcount.tex
\newread\buildfile
\newcount\buildnum
\openin\buildfile=buildcount.dat
\ifeof\buildfile
  \buildnum=1
\else
  \read\buildfile to \buildnum
\fi
\closein\buildfile

This document has been compiled \the\buildnum\ times.
Compile again and this number will increase.

\immediate\openout\buildfile=buildcount.dat
\immediate\write\buildfile{\the\numexpr\buildnum+1\relax}
\immediate\closeout\buildfile
```

**4.2 The Changelog**
Each compilation appends to a changelog that appears IN the document.

```latex
% Document shows its entire build history
Previous compilations:
\input{compile_history.log}

% At end of compile:
\immediate\write\historyfile{\today\ \currenttime: Compiled successfully.}
```

**4.3 The Quine**
A LaTeX document that outputs its own source code (or approximation thereof).

```latex
% Document contains a listing of itself
\section{Source}
\lstinputlisting[language=TeX]{\currfilename}
```

**4.4 The Infinite Regress**
Document A includes Document B which includes Document A... handled by guards.

```latex
\ifdefined\alreadyincluded
  [recursion limit reached]
\else
  \def\alreadyincluded{}
  \include{self}
\fi
```

**4.5 The Hash of Itself**
Document computes and displays a hash of its own source. Changes to the source change the hash displayed.

```latex
% Requires shell escape
\immediate\write18{md5sum \currfilename > hash.tmp}
\input{hash.tmp}
```

### Output
Building the document IS part of the art. The .log file, the .aux file, the build count—all are artifacts.

---

## SYNTHESIS: The Complete Collection

### Title
**self.tex** — A LaTeX Collection That Executes Itself

### Structure
```
self.tex                    % Main document
├── 01_self_reference.tex   % Approach 1: Counts itself
├── 02_animation.tex        % Approach 2: Limits and integrals
├── 03_source_poem.tex      % Approach 3: Code as reading
├── 04_recursive.tex        % Approach 4: Build awareness
├── 05_shaped.tex           % NEW: Shapepar calligrams
└── buildcount.dat          % Persistent state across compiles
```

### Theme
Each section embodies a different aspect of self-execution:
1. **Introspection** (knowing yourself)
2. **Temporal unfolding** (becoming in time)
3. **Dual existence** (source/output)
4. **Meta-awareness** (knowing you're being compiled)
5. **Visual performance** (shape as meaning)

---

## NEW APPROACH 5: Shaped/Concrete Poetry (from research)

### Concept
Text that takes the shape of its meaning. The form IS the content.

### Technical Implementation
```latex
\usepackage{shapepar}
\usepackage{tikz}
\usetikzlibrary{calc,fit,intersections}
```

### Pieces

**5.1 The Integral Shape**
```latex
% Text flows in the shape of an integral sign
% Content: meditation on accumulation
\def\integralshape{%
  % Define bezier curves tracing ∫ symbol
}
\shapepar{\integralshape}{%
  accumulation the way memory builds
  layer upon layer until the sum
  of all moments equals existence
  the integral of experience over time
  approaching but never reaching
  the limit of what we can hold...
}
```

**5.2 The Limit Arrow**
```latex
% Text that narrows to a point (→)
% Content: approaching, convergence, asymptote
\shapepar{\arrowshape}{%
  everything approaches something else
  the gap closes exponentially
  half then half then half again
  Zeno knew this paradox
  infinite steps to cross
  a finite distance yet
  we arrive we always
  arrive though we
  cannot say how
  the arrow
  flies
  →
}
```

**5.3 The Möbius Strip** (Advanced)
```latex
% Using TikZ 3D to render text on a Möbius strip
% The same text, read twice, means differently
\begin{tikzpicture}
  % Möbius surface
  % Text mapped to surface
  % "This side" and "that side" are the same side
\end{tikzpicture}
```

**5.4 The Grasshopper**
```latex
% e.e. cummings "r-p-o-p-h-e-s-s-a-g-r"
% Using Gwern's insight: monospace font + precise spacing
\begin{verbatim}
r-p-o-p-h-e-s-s-a-g-r
                       who
  a)s w(e loo)k
  upnowgath
                   PPEGORHRASS
\end{verbatim}
% The grasshopper reassembles itself as you read
```

---

## APPROACH 6: Critical Edition as Performance (from research)

### Concept
Use `poemscol` or `reledmac` apparatus to create poetry where the *annotations perform*. The footnotes aren't commentary—they're part of the poem.

### Implementation
```latex
\usepackage{poemscol}

\begin{poem}
\begin{stanza}
This line contains an error\edmark \verseline
\correction{error}{truth hidden in plain sight}
which the apparatus reveals\edmark \verseline
\variant{reveals}{conceals, displays, performs}
\end{stanza}
\end{poem}
```

The "critical apparatus" becomes the poem's second voice. Emendations are revelations. Variants are possibilities. The scholarly form becomes lyric form.

---

## IMPLEMENTATION ROADMAP (REVISED)

### Phase 1: Setup & Proof of Concept (Day 1)
- [ ] Install/verify packages: `verse`, `poetry`, `poemscol`, `shapepar`, `animate`, `tikz`
- [ ] Create minimal self-referential document (counts its own equations)
- [ ] Test animate package with simple limit visualization
- [ ] Write first source-poem piece (dual-reading .tex file)
- [ ] Test buildcount mechanism
- [ ] Test shapepar with simple shape

### Phase 2: Individual Pieces (Days 2-3)
- [ ] Build out 3-4 pieces per approach
- [ ] Test PDF viewer compatibility for animations
- [ ] Refine source-as-poetry readability
- [ ] Ensure recursive builds don't break
- [ ] Develop shaped poetry pieces (integral, arrow)
- [ ] Experiment with critical edition apparatus as lyric

### Phase 3: Typography Focus (Day 4)
- [ ] Select monospace serif font (Nimbus Mono L or alternative)
- [ ] Implement Gwern-style "Source Code WYSIWYG" where applicable
- [ ] Handle concrete poetry whitespace precisely
- [ ] Test caesura styling for any alliterative pieces

### Phase 4: Integration (Day 5)
- [ ] Combine into unified collection `self.tex`
- [ ] Design consistent visual style (match selfexecuting.art aesthetic)
- [ ] Add navigation and commentary
- [ ] Test full build process
- [ ] Create fallback static versions for non-animated viewers

### Phase 5: Distribution (Day 6)
- [ ] Publish .tex source to selfexecuting.art/latex/
- [ ] Publish compiled PDF
- [ ] Write about page explaining the concept
- [ ] Link from paper.html as "LaTeX implementation"
- [ ] Add to monospacepoetry.com gallery

---

## TECHNICAL NOTES (REVISED)

### Required Packages
| Package | Purpose | Notes |
|---------|---------|-------|
| `verse` | Basic verse layout | Mouse's Tale capability |
| `poetry` | Poem indexing/TOC | First lines index |
| `poemscol` | Critical editions | Requires `fancyhdr` |
| `shapepar` | Shaped paragraphs | Heart, custom polygons |
| `animate` | PDF animation | Adobe Acrobat only |
| `tikz` | Graphics/paths | Core for visual pieces |
| `totcount` | Counter introspection | Self-reference |
| `zref` | Advanced cross-refs | Self-reference |

### Font Considerations (from Gwern)
- **Problem**: Proportional fonts break visual alignment in `<pre>` contexts
- **Solution**: Monospace serif font
- **Options**:
  - Nimbus Mono L (Gwern's choice - good italics)
  - Courier Prime
  - CMU Typewriter
  - Libertinus Mono
- LaTeX: `\usepackage{nimbusmono}` or similar

### Compatibility Matrix

| Feature | Any PDF | Acrobat | Source | Notes |
|---------|---------|---------|--------|-------|
| Self-reference | ✓ | ✓ | — | Counters, metadata |
| Animation | ✗ | ✓ | — | `animate` package |
| Source poem | — | — | ✓ | .tex file is the art |
| Recursive | ✓ | ✓ | — | Needs `-shell-escape` |
| Shaped text | ✓ | ✓ | — | Static output |
| Concrete poetry | ✓ | ✓ | — | Monospace required |

### Build Requirements
```bash
# Standard build
pdflatex self.tex

# With shell escape (for recursive/meta features)
pdflatex -shell-escape self.tex

# Full build with indices
pdflatex self.tex
makeindex self  # if using first-lines index
pdflatex self.tex
```

### Fallbacks for Non-Acrobat Viewers
- Static "keyframes" showing beginning/middle/end states of animations
- QR code linking to web version (selfexecuting.art/notation_performs.html)
- Separate animated GIF exports for embedding

---

## CONNECTIONS TO EXISTING WORK

### selfexecuting.art Pieces to Port
| Web Piece | LaTeX Approach |
|-----------|----------------|
| Memory (lim → 0, ∫ = ∃) | Animate: fading text, accumulating symbol |
| Recursion (factorial) | Animate: stack building/collapsing |
| Convergence (Zeno) | Animate: series terms, approaching 1 |
| Collaboration (f: H×A→α) | Self-reference: document describes itself |
| The Question (P=?) | Animate: probability cloud, never resolving |
| Self-Reference | Meta: quine-like, includes own source |

### New Pieces Enabled by LaTeX
| Piece | Concept |
|-------|---------|
| The Compile | Document changes each time you build it |
| The Counter | Equation that counts itself into existence |
| The Shape | Text that takes form of its meaning |
| The Apparatus | Critical edition where notes ARE the poem |
| The Phantom | Whitespace as precise as text (versephantom) |
| The Dual | Source reads as poem, compiles to something else |

---

## THE META-POINT

This plan is itself an instance of the collaboration function:

$$f(h_{\text{Ryan}}, a_{\text{Claude}}) = \alpha_{\text{plan}}$$

The plan describes how to make LaTeX that describes itself.
The description is the instruction.
The formula performs.
