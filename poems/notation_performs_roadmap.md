# Notation Performs — Roadmap

> *The formula is the score. The canvas is the orchestra.*

---

## Core Philosophy

Mathematical notation that **executes itself**. Not description—instruction.

When you write `\int`, something integrates.  
When you write `\lim_{t \to \infty}`, something approaches.  
The math isn't metaphor. It's command.

---

## Current Pieces (v1)

| # | Title | Notation | Concept |
|---|-------|----------|---------|
| 1 | memory | `lim_{t→∞} memory(t) = 0` / `∫artifact(t)dt = ∃` | Memory fades, artifacts persist |
| 2 | recursion | `f(n) = n·f(n-1)` | Stack builds and unwinds |
| 3 | convergence | `Σ(1/2^n) = 1` | Zeno's paradox—approaching, never reaching |
| 4 | collaboration | `f: Human × AI → Artifact` | Surjective, not injective |
| 5 | the question | `P(conscious \| behavior) = ?` | Undefined prior, unresolved probability |

---

## Future Pieces

### 6. The Inverse

**Notation:**
```
d/dx ∫f(x)dx = f(x)
```

**Concept:** Differentiation undoes integration. The derivative as *forgetting* what the integral *remembered*.

**Visual:** Watch something accumulate (area under curve growing), then a second phase where differentiation dissolves it back to instantaneous rate. Two movements: gathering, then releasing.

**Interpretation:** Some things can be undone. The integral remembers every moment; the derivative returns you to *this* moment only. History vs. presence.

**Technical considerations:**
- Two-phase animation
- Color shift between integrate (cool/blue) and differentiate (warm/orange)
- The "artifact" from integration should visibly decompose

**Status:** Concept  
**Priority:** High — completes the calculus narrative

---

### 7. Incompleteness

**Notation:**
```
∃ G : ¬Provable(G) ∧ True(G)
```

**Concept:** Gödel's incompleteness theorem. A statement that's true but unprovable within its own system.

**Visual:** A shape that clearly *is* something—the viewer can see it—but the canvas can never finish drawing it. Lines approach but don't close. The performance performs its own impossibility.

**Interpretation:** Some truths exist outside proof. The system cannot contain its own verification. You know it's true because you're outside looking in.

**Technical considerations:**
- Never-completing geometry (tantalizingly close to closure)
- Perhaps: the shape is "obviously" a circle, but the drawing spirals infinitely inward
- Or: a statement appears letter by letter but the final character never renders

**Status:** Concept  
**Priority:** Medium — philosophically rich, technically subtle

---

### 8. Divergence

**Notation:**
```
Σ(1/n) → ∞
```

**Concept:** The harmonic series diverges. Unlike convergence (piece 3), this sum grows without bound—but so slowly you almost believe it's finite.

**Visual:** A bar that fills... and fills... and keeps filling past the frame. The canvas itself becomes insufficient. Overflow.

**Interpretation:** Patience reveals infinity. What looks bounded isn't. Some accumulations never stop.

**Technical considerations:**
- Bar exceeds canvas bounds
- Perhaps the canvas itself stretches
- Logarithmic pacing (slow start, endless continuation)

**Status:** Concept  
**Priority:** Medium — good counterpoint to convergence

---

### 9. Fixed Point

**Notation:**
```
f(x) = x
```

**Concept:** A fixed point—where input equals output. Stability in recursion.

**Visual:** Particles or values bouncing chaotically, then spiraling into a single stable point. The system finds its attractor.

**Interpretation:** Some things don't change when you apply the function. Self-consistency. Identity.

**Technical considerations:**
- Start with chaos/randomness
- Converge to stillness
- Could show multiple starting points all reaching same fixed point

**Status:** Concept  
**Priority:** Low — elegant but less conceptually urgent

---

### 10. Self-Reference

**Notation:**
```
This : Notation → Canvas → Meaning
```

**Concept:** A piece about the project itself. The notation describes what the canvas is doing, and the canvas performs the description.

**Visual:** The formula is written on the canvas. As it's written, the writing itself is the performance. The loop is the point.

**Interpretation:** We are watching ourselves watching. The frame contains the framing.

**Technical considerations:**
- Canvas draws its own formula
- Perhaps: the formula changes as it's drawn (self-modifying)
- Meta-layer: show the JavaScript that's executing?

**Status:** Concept  
**Priority:** High — should be the closing piece or an "about" section

---

## Future Features

### A. Time Signatures

**Concept:** Notation encodes *tempo*, not just structure.

| Notation Type | Tempo |
|---------------|-------|
| `lim_{t→∞}` | Slow, asymptotic stretch |
| `Σ` (sum) | Beat by beat, discrete rhythm |
| `∫` (integral) | Continuous flow |
| `!` (factorial) | Accelerating cascade |
| `=` (equality) | Snap—immediate resolution |

**Implementation ideas:**
- CSS custom property `--tempo` per piece
- Easing functions derived from the math (exponential decay for limits, linear for sums)
- BPM metadata in the notation itself?

**Status:** Design phase  
**Priority:** High — transforms the feel of the whole project

---

### B. Sonification

**Concept:** The canvas is the orchestra. Orchestras make *sound*.

| Piece | Sound |
|-------|-------|
| memory | Sustained tone fading to silence + crystalline accumulation sounds |
| recursion | Ascending pitch (stack up), descending (unwind), like a spiral |
| convergence | Frequency halving—octaves descending toward a fundamental |
| collaboration | Two distinct timbres interweaving |
| the question | Noise/static that never resolves to a clear tone |

**Implementation ideas:**
- Web Audio API
- Tone.js for synthesis
- Optional (button toggle)—respect users who don't want sound
- Could be its own "mode" of the site

**Status:** Concept  
**Priority:** Medium — transformative but scope creep risk

---

### C. The Composer (Interactive Mode)

**Concept:** Audience becomes composer. You write notation, watch it execute.

**Interface:**
```
┌─────────────────────────────────────┐
│  \int_{0}^{t} _____ dt              │  ← user types here
├─────────────────────────────────────┤
│                                     │
│         [canvas performs]           │
│                                     │
└─────────────────────────────────────┘
```

**Vocabulary (parseable notation):**
- `\int` → integration behavior
- `\lim` → approach behavior  
- `\sum` → discrete accumulation
- `\frac{d}{dt}` → rate/instantaneous behavior
- `\prod` → multiplication cascade
- `\sqrt` → extraction/reduction

**Implementation ideas:**
- KaTeX for rendering input
- Parser that maps LaTeX tokens to performer functions
- Composable behaviors (what if you integrate a sum?)
- Sandbox mode vs. gallery mode

**Status:** Ambitious concept  
**Priority:** Low for v1, but this is the *destination*

---

### D. Piece Pages

**Concept:** Each piece gets its own page with:
- Full-screen canvas
- Extended interpretation / artist statement
- Variations (different parameters)
- Share link with specific state

**Structure:**
```
/pieces/memory.html
/pieces/recursion.html
/pieces/convergence.html
...
```

**Status:** Structural decision  
**Priority:** Medium — after core pieces work

---

## Technical Requirements

### Must Have (v1)
- [ ] `style.css` — dark theme, monospace, canvas-forward layout
- [ ] `performers.js` — animation engines for each piece
- [ ] `main.js` — KaTeX rendering, button wiring
- [ ] Responsive canvas sizing
- [ ] Clean performance (requestAnimationFrame, no jank)

### Should Have (v1.1)
- [ ] Reset button per piece
- [ ] Piece state management (running/stopped/complete)
- [ ] Keyboard navigation (arrow keys between pieces)
- [ ] Prefers-reduced-motion respect

### Could Have (v2)
- [ ] Sonification layer
- [ ] Time signature system
- [ ] Piece pages
- [ ] Share functionality

### Future (v3+)
- [ ] The Composer (interactive mode)
- [ ] User-submitted pieces
- [ ] Collaboration with other artists (guest pieces)

---

## Domain & Identity

**Name options:**
- `notationperforms.com` ← direct, memorable
- `theformulaperforms.com`
- `performingnotation.com`
- `notation.run` ← if available

**Visual identity:**
- Integral sign (∫) as favicon ✓ (already in index.html)
- JetBrains Mono throughout
- Dark background, light notation
- Canvas as central artifact

**Sister relationship:**
- Link to/from monospacepoetry.com
- Shared aesthetic DNA
- Different medium, same sensibility

---

## Development Phases

### Phase 1: Foundation
*Make the five pieces work.*

1. Create `style.css`
2. Create `performers.js` with all five animations
3. Create `main.js` for wiring
4. Test locally
5. Deploy

### Phase 2: Polish
*Make it feel right.*

1. Time signatures / tempo refinement
2. Responsive design
3. Reduced motion support
4. Reset functionality
5. Add pieces 6-7 (Inverse, Self-Reference)

### Phase 3: Sound
*The orchestra speaks.*

1. Sonification design per piece
2. Web Audio implementation
3. Toggle UI
4. Audio-visual sync

### Phase 4: Interaction
*The Composer.*

1. Design parseable notation vocabulary
2. Build input interface
3. Map tokens to behaviors
4. Sandbox testing
5. Launch interactive mode

---

## Open Questions

1. **Should pieces auto-play on scroll into view?** Or require explicit "perform" click?

2. **How do pieces "end"?** Do they loop? Freeze on final frame? Fade to notation-only?

3. **Is there a narrative order?** Should pieces connect (memory → recursion → convergence = a journey)?

4. **Multi-piece compositions?** What if you could run two pieces simultaneously and watch them interact?

5. **Accessibility:** How do we describe these performances for screen reader users?

---

## Notes & Inspirations

- Sol LeWitt: instructions as art
- John Cage: notation as score, indeterminacy
- Bret Victor: explorable explanations
- 3Blue1Brown: math as motion
- AIVA/AI music: generation from rules

---

*Last updated: February 5, 2026*  
*Collaborators: Human × Claude*
