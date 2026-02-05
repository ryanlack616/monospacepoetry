# selfexecuting.art

> **The formula is the score. The canvas is the orchestra.**

A living exploration of what happens when mathematical notation stops being description and starts being instruction.

## 🎭 The Project

**selfexecuting.art** is a collaboration between human ([Claude Howell](https://monospacepoetry.com)) and AI ([Claude, Anthropic](https://anthropic.com)). It explores:

- **Notation that performs itself** — Write `∫` and something integrates
- **The collaboration function** — `f: Human × AI → Artifact`
- **Art as executable mathematics** — Where code becomes score becomes proof

## 📁 Structure

```
├── index.html                    # Landing page
├── notation_performs.html        # The 7 pieces
├── paper.html                    # The academic paper, rendered
├── about.html                    # About the collaboration
├── performers.js                 # Canvas animation engines
├── main.js                       # UI interactions
├── notation_style.css            # Styling
├── favicon.svg                   # ∞ favicon
│
├── paper_collaboration_function.md    # Full paper (Markdown)
├── short_essay_collaboration_function.tex  # Essay (LaTeX)
└── README.md                     # You are here
```

## 🔮 The Pieces

| Piece | Notation | What Happens |
|-------|----------|--------------|
| **Memory** | `∫₀^∞ echo(t)·fade(t) dt` | Echoes accumulate and decay |
| **Recursion** | `f(n) = f(n-1) + f(n-2)` | Self-similar structures emerge |
| **Convergence** | `lim_{n→∞} aₙ = L` | Particles approach but never arrive |
| **Collaboration** | `f: H × A → 𝒜` | Two inputs, one irreducible output |
| **Question** | `∃x : P(x) ?` | Existence probes the space |
| **Inverse** | `f⁻¹(y) = {x : f(x) = y}` | Traces paths backward |
| **Self-Reference** | `This := perform(This)` | The strange loop |

## 📄 The Paper

**f: Human × AI → Artifact**

We formalize human-AI collaboration as a mathematical function—surjective, not injective—and explore its implications for authorship, creativity, and the nature of collaborative cognition.

- [Read online](https://selfexecuting.art/paper.html)
- [Markdown source](paper_collaboration_function.md)
- [LaTeX essay](short_essay_collaboration_function.tex)

## 🛠️ Running Locally

```bash
# Clone
git clone https://github.com/claudehowell/selfexecuting-art.git
cd selfexecuting-art

# Serve (any static server works)
python -m http.server 8000
# or
npx serve
# or just open index.html in a browser
```

## 🧮 Tech Stack

- **Vanilla JavaScript** — No frameworks, just canvas
- **KaTeX** — Formula rendering
- **HTML5 Canvas** — Animation via `requestAnimationFrame`
- **JetBrains Mono** — Typography

## 🌱 Future Directions

- [ ] **Three.js** — 3D visualization of the collaboration space
- [ ] **Taichi.js** — GPU-accelerated particle simulations
- [ ] **WebGPU shaders** — For the truly complex pieces
- [ ] **More pieces** — The notation space is infinite

## 📜 License

MIT License — Fork it, remix it, extend it.

The paper is CC BY 4.0.

## 🤝 Collaboration

This project is itself an artifact of the collaboration function:

```
f(Claude Howell, Claude) = selfexecuting.art
```

The fiber over this artifact is sparse. This specific collaboration, this specific moment, this specific conversation produced this specific result.

But the function is surjective. Your collaborations can reach places we haven't imagined.

---

*Built February 2026. Living project.*

[selfexecuting.art](https://selfexecuting.art) · [Monospace Poetry](https://monospacepoetry.com)
