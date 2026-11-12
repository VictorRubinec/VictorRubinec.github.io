/**
 * js/three-hero.js
 * Visual 3D Paramétrico Dedicado para a Coluna Hero (Design Split)
 * Padrão Anti-Slop: Icosaedro geométrico poligonal com nós de vértices (constelação matemática)
 * Recursos de engenharia:
 * - Coluna dedicada sem sobreposição de textos
 * - Drag interativo (Click and Drag / Touch) com inércia física suave
 * - IntersectionObserver para pausar requestAnimationFrame fora do viewport
 * - Respeito rigoroso a prefers-reduced-motion
 * - Transição dinâmica de paleta entre Dark e Light Mode
 */

(function initHeroThree() {
    if (typeof THREE === 'undefined') {
        window.addEventListener('DOMContentLoaded', initHeroThree);
        return;
    }

    const container = document.getElementById('hero-canvas-container');
    const heroSection = document.getElementById('hero');

    if (!container || !heroSection) {
        return;
    }

    // Configurações de cores para a geometria dedicada
    const COLOR_THEMES = {
        light: {
            edges: 0x71717A,
            edgesOpacity: 0.38,
            nodes: 0x7C3AED,
            nodesOpacity: 0.90,
            particles: 0x52525B,
            particlesOpacity: 0.35
        },
        dark: {
            edges: 0x94A3B8,
            edgesOpacity: 0.32,
            nodes: 0xA78BFA,
            nodesOpacity: 0.95,
            particles: 0xCBD5E1,
            particlesOpacity: 0.40
        }
    };

    function isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    function getCurrentTheme() {
        return isDarkMode() ? COLOR_THEMES.dark : COLOR_THEMES.light;
    }

    // Cena, Câmera e Renderizador
    const scene = new THREE.Scene();

    let width = container.clientWidth || 450;
    let height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Grupo principal para animação coordenada
    const mainGroup = new THREE.Group();
    mainGroup.position.set(0, 0, 0);
    scene.add(mainGroup);

    const themeColors = getCurrentTheme();

    // Materiais compartilhados para consistência e performance
    const edgeMaterial = new THREE.LineBasicMaterial({
        color: themeColors.edges,
        transparent: true,
        opacity: themeColors.edgesOpacity,
        linewidth: 1
    });

    const nodesMaterial = new THREE.PointsMaterial({
        color: themeColors.nodes,
        size: 0.12,
        transparent: true,
        opacity: themeColors.nodesOpacity
    });

    // Função de fábrica para construir geometrias paramétricas com arestas e nós nos vértices
    function buildShape(geometry) {
        const group = new THREE.Group();

        // 1. Arestas em Wireframe
        const wireframeGeometry = new THREE.WireframeGeometry(geometry);
        const edgeLines = new THREE.LineSegments(wireframeGeometry, edgeMaterial);
        group.add(edgeLines);

        // 2. Nós nos vértices (Interseções luminosas)
        const vertexPositions = [];
        const positionAttr = geometry.attributes.position;
        const vertexMap = new Set();

        for (let i = 0; i < positionAttr.count; i++) {
            const x = positionAttr.getX(i);
            const y = positionAttr.getY(i);
            const z = positionAttr.getZ(i);
            const key = `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;
            if (!vertexMap.has(key)) {
                vertexMap.add(key);
                vertexPositions.push(x, y, z);
            }
        }

        const nodesGeometry = new THREE.BufferGeometry();
        nodesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertexPositions, 3));
        const nodes = new THREE.Points(nodesGeometry, nodesMaterial);
        group.add(nodes);

        return group;
    }

    // 3 Formas Matemáticas Canônicas (Esfera, Anel e Cubo)
    const shapes = {
        sphere: buildShape(new THREE.IcosahedronGeometry(1.85, 1)),
        torus: buildShape(new THREE.TorusGeometry(1.45, 0.45, 10, 24)),
        cube: buildShape(new THREE.BoxGeometry(2.35, 2.35, 2.35, 2, 2, 2))
    };

    // Subgrupo que abriga a forma ativa
    const shapeWrapper = new THREE.Group();
    mainGroup.add(shapeWrapper);

    let activeShapeKey = 'sphere';

    // Inicialização das formas
    Object.keys(shapes).forEach(key => {
        const shape = shapes[key];
        shapeWrapper.add(shape);
        if (key === activeShapeKey) {
            shape.scale.set(1, 1, 1);
            shape.visible = true;
        } else {
            shape.scale.set(0.001, 0.001, 0.001);
            shape.visible = false;
        }
    });

    // Seletor de Formas HTML
    const shapeButtons = document.querySelectorAll('.shape-btn');
    if (shapeButtons.length > 0) {
        shapeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetShape = btn.getAttribute('data-shape');
                if (!targetShape || !shapes[targetShape] || targetShape === activeShapeKey) return;

                shapeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeShapeKey = targetShape;
            });
        });
    }

    // Nuvem orbital de micro-partículas
    const particleCount = 42;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        const radius = 2.8 + Math.random() * 1.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI * 0.8;

        particlePositions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
        particlePositions[i * 3 + 1] = radius * Math.sin(phi);
        particlePositions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);
    }

    const cloudGeometry = new THREE.BufferGeometry();
    cloudGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const cloudMaterial = new THREE.PointsMaterial({
        color: themeColors.particles,
        size: 0.05,
        transparent: true,
        opacity: themeColors.particlesOpacity
    });

    const cloud = new THREE.Points(cloudGeometry, cloudMaterial);
    mainGroup.add(cloud);

    // Atualização Dinâmica de Cores conforme tema
    function updateThemeColors() {
        const activeTheme = getCurrentTheme();
        edgeMaterial.color.setHex(activeTheme.edges);
        edgeMaterial.opacity = activeTheme.edgesOpacity;
        edgeMaterial.needsUpdate = true;

        nodesMaterial.color.setHex(activeTheme.nodes);
        nodesMaterial.opacity = activeTheme.nodesOpacity;
        nodesMaterial.needsUpdate = true;

        cloudMaterial.color.setHex(activeTheme.particles);
        cloudMaterial.opacity = activeTheme.particlesOpacity;
        cloudMaterial.needsUpdate = true;
    }

    const themeObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                updateThemeColors();
                renderer.render(scene, camera);
                break;
            }
        }
    });

    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    // ================= CONTROLES DE ARRASTE (DRAG / TOUCH) =================
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let velocityX = 0;
    let velocityY = 0;

    // Hover sutil
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    function startDrag(clientX, clientY) {
        isDragging = true;
        previousPointerX = clientX;
        previousPointerY = clientY;
        velocityX = 0;
        velocityY = 0;
        container.classList.add('is-dragging');
    }

    function moveDrag(clientX, clientY) {
        if (!isDragging) {
            const rect = container.getBoundingClientRect();
            targetMouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
            targetMouseY = -((clientY - rect.top) / rect.height) * 2 + 1;
            return;
        }

        const deltaX = clientX - previousPointerX;
        const deltaY = clientY - previousPointerY;

        const sensitivity = 0.007;
        velocityY = deltaX * sensitivity;
        velocityX = deltaY * sensitivity;

        mainGroup.rotation.y += velocityY;
        mainGroup.rotation.x += velocityX;

        previousPointerX = clientX;
        previousPointerY = clientY;
    }

    function endDrag() {
        if (isDragging) {
            isDragging = false;
            container.classList.remove('is-dragging');
        }
    }

    // Mouse Events
    container.addEventListener('mousedown', (e) => {
        startDrag(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
        moveDrag(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('mouseup', () => {
        endDrag();
    });

    // Mobile Touch Events
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            startDrag(touch.clientX, touch.clientY);
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && isDragging) {
            const touch = e.touches[0];
            moveDrag(touch.clientX, touch.clientY);
        }
    }, { passive: true });

    window.addEventListener('touchend', () => {
        endDrag();
    });

    // Resize Responsivo com Enquadramento Dinâmico
    function onResize() {
        if (!container) return;
        width = container.clientWidth;
        height = container.clientHeight;

        if (width === 0 || height === 0) return;

        const aspect = width / height;
        camera.aspect = aspect;

        // Se o container for estreito (aspect < 1), recua a câmera proporcionalmente
        // para garantir que o objeto 3D nunca invada ou corte as laterais
        if (aspect < 1.0) {
            camera.position.z = Math.max(7.5, 7.5 / aspect);
        } else {
            camera.position.z = 7.5;
        }

        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', onResize);
    // Dispara após um curto intervalo para garantir dimensões finais do layout
    setTimeout(onResize, 100);

    // Preferência de Movimento Reduzido (Acessibilidade)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isMotionReduced = prefersReducedMotion.matches;

    prefersReducedMotion.addEventListener('change', (e) => {
        isMotionReduced = e.matches;
        if (isMotionReduced) {
            stopLoop();
            renderer.render(scene, camera);
        } else if (isHeroVisible) {
            startLoop();
        }
    });

    // Render Loop e Otimização via IntersectionObserver
    let animationFrameId = null;
    let isHeroVisible = true;

    function animate() {
        if (!isHeroVisible) return;

        animationFrameId = requestAnimationFrame(animate);

        if (!isDragging) {
            // Inércia suave
            velocityX *= 0.93;
            velocityY *= 0.93;
            mainGroup.rotation.x += velocityX;
            mainGroup.rotation.y += velocityY;

            // Rotação autônoma contínua suave
            mainGroup.rotation.y += 0.0016;
            mainGroup.rotation.x += 0.0008;

            // Influência sutil de hover
            currentMouseX += (targetMouseX - currentMouseX) * 0.03;
            currentMouseY += (targetMouseY - currentMouseY) * 0.03;

            mainGroup.rotation.y += currentMouseX * 0.003;
            mainGroup.rotation.x -= currentMouseY * 0.003;
        }

        // Transição suave de escala (morphing/lerp) entre as formas
        Object.keys(shapes).forEach(key => {
            const shape = shapes[key];
            const isTarget = (key === activeShapeKey);
            const targetScale = isTarget ? 1.0 : 0.001;

            if (isTarget) {
                shape.visible = true;
            }

            const currentScale = shape.scale.x;
            const nextScale = currentScale + (targetScale - currentScale) * 0.12;
            shape.scale.set(nextScale, nextScale, nextScale);

            if (!isTarget && nextScale < 0.02) {
                shape.visible = false;
            }
        });

        cloud.rotation.y -= 0.0012;
        cloud.rotation.z += 0.0006;

        renderer.render(scene, camera);
    }

    function startLoop() {
        if (isMotionReduced) {
            renderer.render(scene, camera);
            return;
        }
        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(animate);
        }
    }

    function stopLoop() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            isHeroVisible = entry.isIntersecting;
            if (isHeroVisible) {
                startLoop();
            } else {
                stopLoop();
            }
        });
    }, {
        root: null,
        threshold: 0.05
    });

    heroObserver.observe(heroSection);

    renderer.render(scene, camera);
    startLoop();

})();
