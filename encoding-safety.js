/**
 * Monospace Poetry - Character Encoding Safety
 * 
 * STRATEGY: Store poems as JavaScript strings, render to DOM via JS.
 * This ensures UTF-8 is preserved because:
 * 1. JS files are served with charset=utf-8 (via _headers)
 * 2. Template literals preserve exact characters
 * 3. DOM insertion uses proper encoding
 * 
 * NEVER edit poems directly in HTML - always use poems.js
 */

// Character palette - safe to copy/paste from here
const CHARS = {
    // Box drawing - Light
    boxLight: {
        topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘',
        horizontal: '─', vertical: '│',
        cross: '┼', teeRight: '├', teeLeft: '┤', teeDown: '┬', teeUp: '┴'
    },
    
    // Box drawing - Heavy
    boxHeavy: {
        topLeft: '┏', topRight: '┓', bottomLeft: '┗', bottomRight: '┛',
        horizontal: '━', vertical: '┃',
        cross: '╋', teeRight: '┣', teeLeft: '┫', teeDown: '┳', teeUp: '┻'
    },
    
    // Box drawing - Double
    boxDouble: {
        horizontal: '═', vertical: '║',
        topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝',
        cross: '╬', teeRight: '╠', teeLeft: '╣', teeDown: '╦', teeUp: '╩'
    },
    
    // Box drawing - Rounded
    boxRound: {
        topLeft: '╭', topRight: '╮', bottomLeft: '╰', bottomRight: '╯'
    },
    
    // Shading/gradients
    shade: {
        light: '░', medium: '▒', dark: '▓', solid: '█',
        top: '▀', bottom: '▄', left: '▌', right: '▐'
    },
    
    // Math - Basic
    mathBasic: {
        plus: '+', minus: '−', times: '×', divide: '÷',
        plusMinus: '±', dot: '·', degree: '°', prime: '′', doublePrime: '″'
    },
    
    // Math - Equals & Compare
    mathCompare: {
        equals: '=', notEquals: '≠', approx: '≈', identical: '≡',
        lessThan: '<', greaterThan: '>', lessOrEqual: '≤', greaterOrEqual: '≥',
        muchLess: '≪', muchGreater: '≫'
    },
    
    // Math - Operations
    mathOps: {
        sum: '∑', product: '∏', integral: '∫', doubleIntegral: '∬',
        partial: '∂', delta: '∆', nabla: '∇', sqrt: '√', cubeRoot: '∛'
    },
    
    // Math - Sets
    sets: {
        elementOf: '∈', notElementOf: '∉', contains: '∋',
        subset: '⊂', superset: '⊃', subsetOrEqual: '⊆', supersetOrEqual: '⊇',
        emptySet: '∅', intersection: '∩', union: '∪'
    },
    
    // Math - Logic
    logic: {
        and: '∧', or: '∨', not: '¬', xor: '⊻',
        forAll: '∀', exists: '∃', notExists: '∄',
        therefore: '∴', because: '∵', qed: '∎',
        implies: '⇒', impliedBy: '⇐', iff: '⇔'
    },
    
    // Math - Relations
    relations: {
        proportional: '∝', infinity: '∞', perpendicular: '⊥',
        parallel: '∥', notParallel: '∦', angle: '∠'
    },
    
    // Math - Operators (circled)
    operators: {
        circledPlus: '⊕', circledMinus: '⊖', circledTimes: '⊗',
        circledDivide: '⊘', circledDot: '⊙', circledCircle: '⊚'
    },
    
    // Greek letters (common in math)
    greek: {
        alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε',
        zeta: 'ζ', eta: 'η', theta: 'θ', iota: 'ι', kappa: 'κ',
        lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', omicron: 'ο',
        pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', upsilon: 'υ',
        phi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
        // Uppercase
        Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ',
        Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω'
    },
    
    // Superscripts & Subscripts
    superscript: '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ',
    subscript: '₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎',
    
    // Fractions
    fractions: {
        half: '½', third: '⅓', twoThirds: '⅔',
        quarter: '¼', threeQuarters: '¾',
        fifth: '⅕', twoFifths: '⅖', threeFifths: '⅗', fourFifths: '⅘',
        sixth: '⅙', fiveSixths: '⅚',
        eighth: '⅛', threeEighths: '⅜', fiveEighths: '⅝', sevenEighths: '⅞'
    },
    
    // Dots and bullets
    dots: {
        middle: '·', bullet: '•', ring: '○', disc: '●',
        diamond: '◆', diamondEmpty: '◇', star: '★', starEmpty: '☆',
        ellipsis: '…', verticalEllipsis: '⋮', diagonalEllipsis: '⋰'
    },
    
    // Arrows
    arrows: {
        up: '↑', down: '↓', left: '←', right: '→',
        upDown: '↕', leftRight: '↔',
        upLeft: '↖', upRight: '↗', downLeft: '↙', downRight: '↘',
        // Double arrows
        dblLeft: '⇐', dblRight: '⇒', dblUp: '⇑', dblDown: '⇓', dblLeftRight: '⇔'
    },
    
    // Brackets
    brackets: {
        angleLeft: '⟨', angleRight: '⟩',
        doubleAngleLeft: '⟪', doubleAngleRight: '⟫',
        ceilLeft: '⌈', ceilRight: '⌉',
        floorLeft: '⌊', floorRight: '⌋',
        bracketLeft: '⟦', bracketRight: '⟧'
    },
    
    // Shapes
    shapes: {
        square: '□', squareFilled: '■',
        triangle: '△', triangleFilled: '▲',
        triangleDown: '▽', triangleDownFilled: '▼',
        circle: '○', circleFilled: '●',
        lozenge: '◊', lozengeFilled: '⧫'
    },
    
    // Decorative
    decor: {
        section: '§', paragraph: '¶', dagger: '†', doubleDagger: '‡',
        floral: '❧', heart: '♥', spade: '♠', club: '♣', diamond: '♦',
        copyright: '©', registered: '®', trademark: '™'
    }
};

// Validation: detect encoding corruption
function validatePoem(content) {
    const corrupted = [
        /Â·/g,           // Double-encoded middle dot
        /â€"/g,          // Double-encoded em dash
        /â€œ/g,          // Double-encoded smart quote
        /â€/g,           // Double-encoded quote
        /Ã¢/g,           // Double-encoded â
        /â"/g,           // Corrupted box chars
        /Ã©/g,           // Double-encoded é
    ];
    
    const issues = [];
    for (const pattern of corrupted) {
        if (pattern.test(content)) {
            issues.push(`Found corrupted pattern: ${pattern.source}`);
        }
    }
    
    return {
        valid: issues.length === 0,
        issues
    };
}

// Safe render: insert poem into DOM without encoding issues
function renderPoem(containerId, poem) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const validation = validatePoem(poem.content);
    if (!validation.valid) {
        console.warn(`Poem "${poem.title}" has encoding issues:`, validation.issues);
    }
    
    const pre = document.createElement('pre');
    pre.textContent = poem.content; // textContent is encoding-safe
    container.appendChild(pre);
}

// Export for use
if (typeof module !== 'undefined') {
    module.exports = { CHARS, validatePoem, renderPoem };
}
