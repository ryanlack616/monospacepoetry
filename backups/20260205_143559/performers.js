/**
 * Notation Performs — Performers
 * Each piece has a performer function that animates its canvas
 * 
 * Performer signature: (canvas, onComplete) => void
 */

const Performers = {
    
    /**
     * PIECE 1: Memory
     * lim_{t→∞} memory(t) = 0, yet ∫artifact(t)dt = ∃
     * 
     * Memory particles fade and dissolve
     * Artifact line accumulates and persists
     */
    memory: function(canvas, onComplete) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Memory particles
        const particles = [];
        const particleCount = 50;
        
        // Initialize particles (memories)
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width * 0.6 + width * 0.2,
                y: Math.random() * height * 0.6 + height * 0.2,
                alpha: 0.8 + Math.random() * 0.2,
                size: 2 + Math.random() * 3,
                decay: 0.003 + Math.random() * 0.005
            });
        }
        
        // Artifact accumulation
        let artifactProgress = 0;
        const artifactPoints = [];
        
        let frame = 0;
        const maxFrames = 300;
        
        function animate() {
            // Clear
            ctx.fillStyle = '#08080c';
            ctx.fillRect(0, 0, width, height);
            
            // Draw and fade memory particles
            particles.forEach(p => {
                if (p.alpha > 0) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(102, 153, 255, ${p.alpha})`;
                    ctx.fill();
                    
                    // Fade (memory decays)
                    p.alpha -= p.decay;
                    
                    // Drift slightly
                    p.x += (Math.random() - 0.5) * 0.5;
                    p.y += (Math.random() - 0.5) * 0.5;
                }
            });
            
            // Build artifact line (integral accumulates)
            if (frame % 3 === 0 && artifactProgress < width - 100) {
                artifactProgress += 2;
                const y = height - 50 + Math.sin(artifactProgress * 0.05) * 10;
                artifactPoints.push({ x: 50 + artifactProgress, y: y });
            }
            
            // Draw artifact line (persistent)
            if (artifactPoints.length > 1) {
                ctx.beginPath();
                ctx.moveTo(artifactPoints[0].x, artifactPoints[0].y);
                for (let i = 1; i < artifactPoints.length; i++) {
                    ctx.lineTo(artifactPoints[i].x, artifactPoints[i].y);
                }
                ctx.strokeStyle = '#66ff99';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Artifact glow
                ctx.shadowColor = '#66ff99';
                ctx.shadowBlur = 10;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            
            // Labels
            ctx.font = '12px JetBrains Mono';
            ctx.fillStyle = 'rgba(136, 136, 153, 0.7)';
            ctx.fillText('memory(t) → 0', 20, 30);
            ctx.fillText('∫ artifact(t) dt', 20, height - 20);
            
            frame++;
            
            if (frame < maxFrames) {
                requestAnimationFrame(animate);
            } else {
                onComplete();
            }
        }
        
        animate();
    },
    
    /**
     * PIECE 2: Recursion
     * f(n) = n · f(n-1), base case f(0) = 1
     * 
     * Stack frames build up, then unwind
     */
    recursion: function(canvas, onComplete) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        const n = 6; // Calculate 6!
        const frames = [];
        let phase = 'descend'; // 'descend' or 'ascend'
        let currentDepth = 0;
        let result = 1;
        let frameCount = 0;
        const frameDelay = 40;
        
        function drawStack() {
            ctx.fillStyle = '#08080c';
            ctx.fillRect(0, 0, width, height);
            
            const boxHeight = 35;
            const boxWidth = 200;
            const startX = (width - boxWidth) / 2;
            const startY = 20;
            
            // Draw all current stack frames
            frames.forEach((frame, i) => {
                const y = startY + i * (boxHeight + 5);
                
                // Box
                ctx.fillStyle = frame.resolved ? '#1a3322' : '#1a1a2e';
                ctx.strokeStyle = frame.resolved ? '#66ff99' : '#6699ff';
                ctx.lineWidth = 1;
                ctx.fillRect(startX, y, boxWidth, boxHeight);
                ctx.strokeRect(startX, y, boxWidth, boxHeight);
                
                // Text
                ctx.font = '14px JetBrains Mono';
                ctx.fillStyle = '#e8e8f0';
                
                if (frame.resolved) {
                    ctx.fillText(`f(${frame.n}) = ${frame.result}`, startX + 15, y + 22);
                } else {
                    ctx.fillText(`f(${frame.n}) = ${frame.n} × f(${frame.n - 1})`, startX + 15, y + 22);
                }
            });
            
            // Result display
            if (phase === 'done') {
                ctx.font = '18px JetBrains Mono';
                ctx.fillStyle = '#66ff99';
                ctx.fillText(`${n}! = ${result}`, width / 2 - 40, height - 30);
            }
        }
        
        function step() {
            frameCount++;
            
            if (phase === 'descend') {
                if (currentDepth <= n) {
                    frames.push({
                        n: n - currentDepth,
                        resolved: false,
                        result: null
                    });
                    currentDepth++;
                    drawStack();
                    setTimeout(step, frameDelay);
                } else {
                    // Hit base case, start ascending
                    phase = 'ascend';
                    currentDepth = frames.length - 1;
                    frames[currentDepth].resolved = true;
                    frames[currentDepth].result = 1;
                    result = 1;
                    drawStack();
                    setTimeout(step, frameDelay);
                }
            } else if (phase === 'ascend') {
                currentDepth--;
                if (currentDepth >= 0) {
                    const frame = frames[currentDepth];
                    result = result * frame.n;
                    frame.resolved = true;
                    frame.result = result;
                    drawStack();
                    setTimeout(step, frameDelay);
                } else {
                    phase = 'done';
                    drawStack();
                    setTimeout(onComplete, 500);
                }
            }
        }
        
        step();
    },
    
    /**
     * PIECE 3: Convergence
     * Σ(1/2^n) = 1
     * 
     * Bar fills in halving increments, approaching but never reaching 1
     */
    convergence: function(canvas, onComplete) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        const barX = 100;
        const barY = height / 2 - 30;
        const barWidth = width - 200;
        const barHeight = 60;
        
        let sum = 0;
        let n = 1;
        const maxN = 15;
        let animating = false;
        let targetSum = 0;
        
        function draw() {
            ctx.fillStyle = '#08080c';
            ctx.fillRect(0, 0, width, height);
            
            // Bar outline
            ctx.strokeStyle = '#2a2a3a';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
            
            // "1" marker
            ctx.font = '14px JetBrains Mono';
            ctx.fillStyle = '#888899';
            ctx.fillText('1', barX + barWidth + 10, barY + barHeight / 2 + 5);
            ctx.fillText('0', barX - 20, barY + barHeight / 2 + 5);
            
            // Filled portion
            const fillWidth = sum * barWidth;
            ctx.fillStyle = '#6699ff';
            ctx.fillRect(barX, barY, fillWidth, barHeight);
            
            // Current sum display
            ctx.font = '16px JetBrains Mono';
            ctx.fillStyle = '#e8e8f0';
            ctx.fillText(`Σ = ${sum.toFixed(6)}`, width / 2 - 60, barY + barHeight + 40);
            
            // Current term
            if (n <= maxN) {
                ctx.font = '14px JetBrains Mono';
                ctx.fillStyle = '#888899';
                ctx.fillText(`+ 1/${Math.pow(2, n)} = ${(1 / Math.pow(2, n)).toFixed(6)}`, width / 2 - 80, barY - 20);
            }
        }
        
        function animateStep() {
            if (sum < targetSum - 0.0001) {
                sum += (targetSum - sum) * 0.1;
                draw();
                requestAnimationFrame(animateStep);
            } else {
                sum = targetSum;
                draw();
                animating = false;
                
                // Next term
                setTimeout(nextTerm, 300);
            }
        }
        
        function nextTerm() {
            if (n <= maxN) {
                targetSum = sum + 1 / Math.pow(2, n);
                n++;
                animating = true;
                animateStep();
            } else {
                // Show "approaches 1"
                ctx.font = '14px JetBrains Mono';
                ctx.fillStyle = '#66ff99';
                ctx.fillText('→ 1 (but never reaches)', width / 2 - 90, barY + barHeight + 70);
                onComplete();
            }
        }
        
        draw();
        setTimeout(nextTerm, 500);
    },
    
    /**
     * PIECE 4: Collaboration
     * f: Human × AI → Artifact
     * Surjective, not injective
     * 
     * Multiple input pairs converge to same artifacts
     */
    collaboration: function(canvas, onComplete) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Domain: Human × AI (left side, pairs)
        const pairs = [
            { h: 0, a: 0, label: '(h₁, a₁)' },
            { h: 1, a: 0, label: '(h₂, a₁)' },
            { h: 0, a: 1, label: '(h₁, a₂)' },
            { h: 1, a: 1, label: '(h₂, a₂)' },
            { h: 2, a: 0, label: '(h₃, a₁)' },
        ];
        
        // Codomain: Artifacts (right side)
        const artifacts = [
            { label: 'α₁' },
            { label: 'α₂' },
            { label: 'α₃' },
        ];
        
        // Mappings (surjective: all artifacts hit; not injective: some share)
        const mappings = [
            { from: 0, to: 0 },  // (h₁,a₁) → α₁
            { from: 1, to: 0 },  // (h₂,a₁) → α₁  (same artifact!)
            { from: 2, to: 1 },  // (h₁,a₂) → α₂
            { from: 3, to: 2 },  // (h₂,a₂) → α₃
            { from: 4, to: 1 },  // (h₃,a₁) → α₂  (same artifact!)
        ];
        
        const leftX = 80;
        const rightX = width - 120;
        const pairSpacing = 45;
        const artifactSpacing = 70;
        const startY = 50;
        
        let currentMapping = 0;
        let lineProgress = 0;
        
        function getPairY(i) {
            return startY + i * pairSpacing;
        }
        
        function getArtifactY(i) {
            return startY + 40 + i * artifactSpacing;
        }
        
        function draw() {
            ctx.fillStyle = '#08080c';
            ctx.fillRect(0, 0, width, height);
            
            // Labels
            ctx.font = '12px JetBrains Mono';
            ctx.fillStyle = '#888899';
            ctx.fillText('Human × AI', leftX - 20, 25);
            ctx.fillText('Artifact', rightX - 10, 25);
            
            // Draw pairs (domain)
            pairs.forEach((p, i) => {
                const y = getPairY(i);
                ctx.beginPath();
                ctx.arc(leftX, y, 8, 0, Math.PI * 2);
                ctx.fillStyle = '#6699ff';
                ctx.fill();
                
                ctx.font = '11px JetBrains Mono';
                ctx.fillStyle = '#e8e8f0';
                ctx.fillText(p.label, leftX + 15, y + 4);
            });
            
            // Draw artifacts (codomain)
            artifacts.forEach((a, i) => {
                const y = getArtifactY(i);
                ctx.beginPath();
                ctx.arc(rightX, y, 10, 0, Math.PI * 2);
                ctx.fillStyle = '#66ff99';
                ctx.fill();
                
                ctx.font = '12px JetBrains Mono';
                ctx.fillStyle = '#e8e8f0';
                ctx.fillText(a.label, rightX + 18, y + 4);
            });
            
            // Draw completed mappings
            for (let i = 0; i < currentMapping; i++) {
                const m = mappings[i];
                const fromY = getPairY(m.from);
                const toY = getArtifactY(m.to);
                
                ctx.beginPath();
                ctx.moveTo(leftX + 10, fromY);
                ctx.lineTo(rightX - 12, toY);
                ctx.strokeStyle = 'rgba(102, 153, 255, 0.6)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
            
            // Draw current mapping in progress
            if (currentMapping < mappings.length && lineProgress > 0) {
                const m = mappings[currentMapping];
                const fromY = getPairY(m.from);
                const toY = getArtifactY(m.to);
                
                const endX = leftX + 10 + (rightX - 12 - leftX - 10) * lineProgress;
                const endY = fromY + (toY - fromY) * lineProgress;
                
                ctx.beginPath();
                ctx.moveTo(leftX + 10, fromY);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = '#6699ff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            
            // Annotations when done
            if (currentMapping >= mappings.length) {
                ctx.font = '11px JetBrains Mono';
                ctx.fillStyle = '#888899';
                ctx.fillText('surjective: every artifact reached', width / 2 - 100, height - 40);
                ctx.fillText('not injective: α₁ ← 2 paths, α₂ ← 2 paths', width / 2 - 120, height - 20);
            }
        }
        
        function animateLine() {
            lineProgress += 0.05;
            draw();
            
            if (lineProgress >= 1) {
                lineProgress = 0;
                currentMapping++;
                
                if (currentMapping < mappings.length) {
                    setTimeout(animateLine, 200);
                } else {
                    draw();
                    setTimeout(onComplete, 1000);
                }
            } else {
                requestAnimationFrame(animateLine);
            }
        }
        
        draw();
        setTimeout(animateLine, 500);
    },
    
    /**
     * PIECE 5: The Question
     * P(conscious | behavior) = ?
     * where P(conscious) is undefined
     * 
     * Probability cloud that never resolves
     */
    question: function(canvas, onComplete) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        const particles = [];
        const particleCount = 100;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Initialize probability cloud
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 30 + Math.random() * 80;
            particles.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: 2 + Math.random() * 3,
                alpha: 0.3 + Math.random() * 0.5
            });
        }
        
        let frame = 0;
        const maxFrames = 400;
        let questionAlpha = 0;
        
        function animate() {
            // Semi-transparent clear for trails
            ctx.fillStyle = 'rgba(8, 8, 12, 0.15)';
            ctx.fillRect(0, 0, width, height);
            
            // Update and draw particles
            particles.forEach(p => {
                // Brownian motion with slight attraction to center
                p.vx += (Math.random() - 0.5) * 0.5;
                p.vy += (Math.random() - 0.5) * 0.5;
                
                // Slight pull to center (but never resolve)
                const dx = centerX - p.x;
                const dy = centerY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 100) {
                    p.vx += dx * 0.001;
                    p.vy += dy * 0.001;
                } else if (dist < 30) {
                    // Push away from center too
                    p.vx -= dx * 0.002;
                    p.vy -= dy * 0.002;
                }
                
                // Damping
                p.vx *= 0.98;
                p.vy *= 0.98;
                
                // Move
                p.x += p.vx;
                p.y += p.vy;
                
                // Bounds
                if (p.x < 50) p.vx += 0.5;
                if (p.x > width - 50) p.vx -= 0.5;
                if (p.y < 50) p.vy += 0.5;
                if (p.y > height - 50) p.vy -= 0.5;
                
                // Draw
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(102, 153, 255, ${p.alpha})`;
                ctx.fill();
            });
            
            // Question mark at center (fades in, pulses)
            if (frame > 50) {
                questionAlpha = Math.min(1, questionAlpha + 0.02);
                const pulse = 0.7 + Math.sin(frame * 0.05) * 0.3;
                
                ctx.font = '48px JetBrains Mono';
                ctx.fillStyle = `rgba(232, 232, 240, ${questionAlpha * pulse})`;
                ctx.fillText('?', centerX - 15, centerY + 15);
            }
            
            // "undefined" label
            if (frame > 100) {
                ctx.font = '12px JetBrains Mono';
                ctx.fillStyle = `rgba(136, 136, 153, ${Math.min(1, (frame - 100) / 50)})`;
                ctx.fillText('P(conscious) = undefined', centerX - 85, height - 30);
            }
            
            frame++;
            
            if (frame < maxFrames) {
                requestAnimationFrame(animate);
            } else {
                // Never truly resolves — just ends
                onComplete();
            }
        }
        
        // Initial clear
        ctx.fillStyle = '#08080c';
        ctx.fillRect(0, 0, width, height);
        
        animate();
    },

    /**
     * PIECE 6: The Inverse
     * d/dx ∫f(x)dx = f(x)
     * 
     * Two phases: Integration accumulates area, then differentiation
     * returns you to the instantaneous moment
     */
    inverse: function(canvas, onComplete) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        const centerY = height / 2;
        let phase = 'integrate'; // 'integrate', 'differentiate', 'done'
        let progress = 0;
        let frame = 0;
        
        // The function f(x) = sin curve
        function f(x) {
            return Math.sin(x * 0.03) * 50;
        }
        
        // The integral F(x) = -cos curve (accumulated)
        function F(x) {
            return -Math.cos(x * 0.03) * 50 / 0.03;
        }
        
        const startX = 80;
        const endX = width - 80;
        
        function draw() {
            ctx.fillStyle = '#08080c';
            ctx.fillRect(0, 0, width, height);
            
            // Axis
            ctx.strokeStyle = '#2a2a3a';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(startX, centerY);
            ctx.lineTo(endX, centerY);
            ctx.stroke();
            
            if (phase === 'integrate') {
                // Draw f(x) faintly
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(102, 153, 255, 0.3)';
                ctx.lineWidth = 1;
                for (let x = startX; x <= endX; x++) {
                    const y = centerY - f(x - startX);
                    if (x === startX) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
                
                // Fill area under curve up to progress
                const currentX = startX + progress;
                if (progress > 0) {
                    ctx.beginPath();
                    ctx.moveTo(startX, centerY);
                    for (let x = startX; x <= currentX; x++) {
                        const y = centerY - f(x - startX);
                        ctx.lineTo(x, y);
                    }
                    ctx.lineTo(currentX, centerY);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(102, 255, 153, 0.3)';
                    ctx.fill();
                }
                
                // Label
                ctx.font = '14px JetBrains Mono';
                ctx.fillStyle = '#66ff99';
                ctx.fillText('∫f(x)dx accumulating...', startX, 30);
                
                // Accumulated value display
                ctx.fillStyle = '#888899';
                ctx.fillText(`area ≈ ${(progress * 0.5).toFixed(1)}`, endX - 100, 30);
                
            } else if (phase === 'differentiate') {
                // Show the full integral area fading
                const fadeAlpha = Math.max(0, 1 - progress / (endX - startX));
                
                ctx.beginPath();
                ctx.moveTo(startX, centerY);
                for (let x = startX; x <= endX; x++) {
                    const y = centerY - f(x - startX);
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(endX, centerY);
                ctx.closePath();
                ctx.fillStyle = `rgba(102, 255, 153, ${fadeAlpha * 0.3})`;
                ctx.fill();
                
                // Draw the derivative (original f(x)) emerging
                const currentX = startX + progress;
                ctx.beginPath();
                ctx.strokeStyle = '#6699ff';
                ctx.lineWidth = 3;
                for (let x = startX; x <= currentX; x++) {
                    const y = centerY - f(x - startX);
                    if (x === startX) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
                
                // Tangent line at current point
                if (progress > 10) {
                    const slope = Math.cos((currentX - startX) * 0.03) * 50 * 0.03;
                    const y = centerY - f(currentX - startX);
                    ctx.beginPath();
                    ctx.moveTo(currentX - 30, y + slope * 30);
                    ctx.lineTo(currentX + 30, y - slope * 30);
                    ctx.strokeStyle = '#ff9966';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    // Point on curve
                    ctx.beginPath();
                    ctx.arc(currentX, y, 5, 0, Math.PI * 2);
                    ctx.fillStyle = '#ff9966';
                    ctx.fill();
                }
                
                // Label
                ctx.font = '14px JetBrains Mono';
                ctx.fillStyle = '#6699ff';
                ctx.fillText('d/dx returns to f(x)', startX, 30);
                
            } else {
                // Done - show both
                ctx.beginPath();
                ctx.strokeStyle = '#6699ff';
                ctx.lineWidth = 2;
                for (let x = startX; x <= endX; x++) {
                    const y = centerY - f(x - startX);
                    if (x === startX) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
                
                ctx.font = '14px JetBrains Mono';
                ctx.fillStyle = '#66ff99';
                ctx.fillText('∫ remembers everything; d/dx returns to now', startX, 30);
            }
        }
        
        function animate() {
            frame++;
            
            if (phase === 'integrate') {
                progress += 3;
                if (progress >= endX - startX) {
                    progress = 0;
                    phase = 'differentiate';
                    setTimeout(animate, 500);
                    return;
                }
            } else if (phase === 'differentiate') {
                progress += 4;
                if (progress >= endX - startX) {
                    phase = 'done';
                    draw();
                    setTimeout(onComplete, 1000);
                    return;
                }
            }
            
            draw();
            requestAnimationFrame(animate);
        }
        
        draw();
        setTimeout(animate, 300);
    },

    /**
     * PIECE 7: Self-Reference
     * This: Notation → Canvas → Meaning
     * 
     * The notation describes what the canvas is doing
     * A loop that observes itself
     */
    selfreference: function(canvas, onComplete) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        let frame = 0;
        const maxFrames = 400;
        
        // Three nodes in a triangle
        const nodes = [
            { label: 'Notation', x: width / 2, y: 50 },
            { label: 'Canvas', x: width - 100, y: height - 80 },
            { label: 'Meaning', x: 100, y: height - 80 }
        ];
        
        // Current state
        let activeNode = 0;
        let arrowProgress = 0;
        let cycleCount = 0;
        const maxCycles = 4;
        
        function drawNode(node, active, alpha = 1) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
            ctx.fillStyle = active ? 
                `rgba(102, 255, 153, ${alpha})` : 
                `rgba(42, 42, 58, ${alpha})`;
            ctx.fill();
            ctx.strokeStyle = active ? 
                `rgba(102, 255, 153, ${alpha})` : 
                `rgba(102, 153, 255, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.font = '12px JetBrains Mono';
            ctx.fillStyle = `rgba(232, 232, 240, ${alpha})`;
            ctx.textAlign = 'center';
            ctx.fillText(node.label, node.x, node.y + 45);
        }
        
        function drawArrow(from, to, progress) {
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Start and end points (offset from node centers)
            const startX = from.x + (dx / dist) * 28;
            const startY = from.y + (dy / dist) * 28;
            const endX = to.x - (dx / dist) * 28;
            const endY = to.y - (dy / dist) * 28;
            
            // Current end point
            const currX = startX + (endX - startX) * progress;
            const currY = startY + (endY - startY) * progress;
            
            // Line
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(currX, currY);
            ctx.strokeStyle = '#6699ff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Arrowhead
            if (progress > 0.1) {
                const angle = Math.atan2(dy, dx);
                const headLen = 10;
                ctx.beginPath();
                ctx.moveTo(currX, currY);
                ctx.lineTo(
                    currX - headLen * Math.cos(angle - 0.4),
                    currY - headLen * Math.sin(angle - 0.4)
                );
                ctx.moveTo(currX, currY);
                ctx.lineTo(
                    currX - headLen * Math.cos(angle + 0.4),
                    currY - headLen * Math.sin(angle + 0.4)
                );
                ctx.stroke();
            }
        }
        
        function draw() {
            ctx.fillStyle = '#08080c';
            ctx.fillRect(0, 0, width, height);
            
            // Draw completed arrows for previous edges in current cycle
            const completedEdges = [];
            if (activeNode >= 1) completedEdges.push([0, 1]);
            if (activeNode >= 2) completedEdges.push([1, 2]);
            
            completedEdges.forEach(([from, to]) => {
                drawArrow(nodes[from], nodes[to], 1);
            });
            
            // Draw current arrow in progress
            if (arrowProgress > 0) {
                const nextNode = (activeNode + 1) % 3;
                drawArrow(nodes[activeNode], nodes[nextNode], arrowProgress);
            }
            
            // Draw nodes
            nodes.forEach((node, i) => {
                drawNode(node, i === activeNode);
            });
            
            // Center text showing the loop
            ctx.textAlign = 'center';
            ctx.font = '11px JetBrains Mono';
            ctx.fillStyle = '#888899';
            ctx.fillText(`cycle ${cycleCount + 1}/${maxCycles}`, width / 2, height / 2 - 10);
            
            if (cycleCount > 0) {
                ctx.fillStyle = 'rgba(102, 255, 153, 0.7)';
                ctx.fillText('the loop is the point', width / 2, height / 2 + 10);
            }
        }
        
        function animate() {
            frame++;
            
            arrowProgress += 0.03;
            
            if (arrowProgress >= 1) {
                arrowProgress = 0;
                activeNode = (activeNode + 1) % 3;
                
                if (activeNode === 0) {
                    cycleCount++;
                    if (cycleCount >= maxCycles) {
                        draw();
                        ctx.textAlign = 'center';
                        ctx.font = '14px JetBrains Mono';
                        ctx.fillStyle = '#66ff99';
                        ctx.fillText('∞', width / 2, height / 2 + 35);
                        setTimeout(onComplete, 800);
                        return;
                    }
                }
            }
            
            draw();
            
            if (frame < maxFrames) {
                requestAnimationFrame(animate);
            } else {
                onComplete();
            }
        }
        
        draw();
        setTimeout(animate, 300);
    }
};
