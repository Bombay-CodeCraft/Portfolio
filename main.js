/* ---------- terminal typing effect ---------- */
(function typeCommand(){
  const cmdEl = document.getElementById('typedCmd');
  const cursorEl = document.getElementById('typeCursor');
  const outputEl = document.getElementById('terminalOutput');
  const command = 'whoami';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    cmdEl.textContent = command;
    outputEl.classList.remove('hidden');
    return;
  }

  let i = 0;
  function typeChar(){
    if (i < command.length) {
      cmdEl.textContent += command[i];
      i++;
      setTimeout(typeChar, 120);
    } else {
      setTimeout(() => {
        cursorEl.style.display = 'none';
        outputEl.classList.remove('hidden');
      }, 400);
    }
  }
  setTimeout(typeChar, 600);
})();

/* ---------- theme toggle (dark / warm amber) ---------- */
(function themeToggle(){
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  function isLight(){
    return root.getAttribute('data-theme') === 'light';
  }

  function syncToggleState(){
    const light = isLight();
    toggle.setAttribute('aria-pressed', String(light));
    toggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to amber theme');
  }
  syncToggleState();

  toggle.addEventListener('click', () => {
    if (isLight()) {
      root.removeAttribute('data-theme');
      try { localStorage.setItem('theme', 'dark'); } catch (e) {}
    } else {
      root.setAttribute('data-theme', 'light');
      try { localStorage.setItem('theme', 'light'); } catch (e) {}
    }
    syncToggleState();
    window.dispatchEvent(new Event('themechange'));
  });
})();

/* ---------- mobile nav toggle ---------- */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ---------- animated network background ---------- */
(function networkCanvas(){
  const canvas = document.getElementById('netCanvas');
  const ctx = canvas.getContext('2d');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let width, height, nodes;
  const NODE_COUNT = 100;
  const LINK_DIST = 165;

  function readParticleRGB(){
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--particle-rgb').trim();
    const parts = raw.split(',').map(n => parseInt(n.trim(), 10));
    if (parts.length === 3 && parts.every(n => !isNaN(n))) {
      return { r: parts[0], g: parts[1], b: parts[2] };
    }
    return { r: 255, g: 255, b: 255 };
  }

  let particleRGB = readParticleRGB();
  window.addEventListener('themechange', () => { particleRGB = readParticleRGB(); });

  function resize(){
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function makeNodes(){
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3
    }));
  }

  function step(){
    ctx.clearRect(0, 0, width, height);

    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;

      // bounce off edges instead of leaving the canvas
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;

      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${particleRGB.r}, ${particleRGB.g}, ${particleRGB.b})`;
      ctx.fill();
    });

    for (let i = 0; i < nodes.length; i++){
      for (let j = i + 1; j < nodes.length; j++){
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST){
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${particleRGB.r}, ${particleRGB.g}, ${particleRGB.b}, ${1 - dist / LINK_DIST})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  window.addEventListener('resize', () => { resize(); });

  resize();
  makeNodes();
  step();
})();

/* ---------- skills radial node graph ---------- */
(function skillsGraph(){
  const container = document.getElementById('skillsGraph');
  const detail = document.getElementById('skillsDetail');
  if (!container || !detail) return;

  const defaultDetail = detail.textContent;

  const skills = [
    { name: 'HTML / CSS / JS', blurb: 'Core front-end fundamentals \u2014 semantic markup, responsive layouts, vanilla JS.' },
    { name: 'Node.js / Express', blurb: 'Server-side JavaScript \u2014 REST APIs, middleware, authentication flows.' },
    { name: 'Supabase', blurb: 'Postgres backend-as-a-service \u2014 row-level security, auth, storage, realtime channels.' },
    { name: 'Python / ReportLab', blurb: 'Scripting and PDF generation for reports and data exports.' },
    { name: 'Socket.io', blurb: 'Real-time bidirectional events \u2014 live scoring boards, live dashboards.' },
    { name: 'Git / GitHub', blurb: 'Version control, branching workflows, collaborative development.' },
    { name: 'REST APIs', blurb: 'Designing and consuming HTTP APIs across full-stack projects.' },
    { name: 'Network Fundamentals', blurb: 'TCP/IP, routing basics, and foundational security concepts.' }
  ];

  const svgNS = 'http://www.w3.org/2000/svg';
  const center = 50;
  const radius = 38;

  const points = skills.map((s, i) => {
    const angle = (Math.PI * 2 * i) / skills.length - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  });

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');

  // faint mesh lines between neighboring nodes, echoing the background network
  points.forEach((p, i) => {
    const next = points[(i + 1) % points.length];
    const mesh = document.createElementNS(svgNS, 'line');
    mesh.setAttribute('x1', p.x);
    mesh.setAttribute('y1', p.y);
    mesh.setAttribute('x2', next.x);
    mesh.setAttribute('y2', next.y);
    mesh.setAttribute('class', 'graph-line mesh');
    svg.appendChild(mesh);
  });

  // spokes from the center node to each skill node
  const spokes = points.map(p => {
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', center);
    line.setAttribute('y1', center);
    line.setAttribute('x2', p.x);
    line.setAttribute('y2', p.y);
    line.setAttribute('class', 'graph-line spoke');
    svg.appendChild(line);
    return line;
  });

  container.appendChild(svg);

  const centerNode = document.createElement('div');
  centerNode.className = 'skill-center';
  centerNode.textContent = 'skills';
  container.appendChild(centerNode);

  skills.forEach((skill, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'skill-node';
    btn.style.left = points[i].x + '%';
    btn.style.top = points[i].y + '%';
    btn.textContent = skill.name;
    btn.setAttribute('aria-describedby', 'skillsDetail');

    const activate = () => {
      detail.textContent = skill.name + ' \u2014 ' + skill.blurb;
      spokes[i].classList.add('active');
    };
    const deactivate = () => {
      spokes[i].classList.remove('active');
      detail.textContent = defaultDetail;
    };

    btn.addEventListener('mouseenter', activate);
    btn.addEventListener('focus', activate);
    btn.addEventListener('mouseleave', deactivate);
    btn.addEventListener('blur', deactivate);

    container.appendChild(btn);
  });
})();