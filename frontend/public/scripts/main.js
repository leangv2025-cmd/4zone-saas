// 4Zone — Main JS

// Theme toggle
const html = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
const saved = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', saved);
if (themeBtn) {
  themeBtn.textContent = saved === 'dark' ? '☀' : '🌙';
  themeBtn.addEventListener('click', () => {
    const t = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
    themeBtn.textContent = t === 'dark' ? '☀' : '🌙';
  });
}

// Navbar scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile nav
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger) {
  hamburger.addEventListener('click', () => navLinks?.classList.toggle('open'));
}
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => navLinks?.classList.remove('open'));
});

// Smooth scroll active link
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let curr = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) curr = s.id; });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + curr);
  });
});

// Contact form
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.textContent = '✓ Sent! We\'ll be in touch.';
    btn.style.background = '#10b981';
    setTimeout(() => { btn.textContent = 'Send Message 📨'; btn.style.background = ''; form.reset(); }, 4000);
  });
}

// Scroll reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none'; } });
}, { threshold: 0.1 });

document.querySelectorAll('.tool-card, .tech-card, .price-card, .partner-card, .about-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
