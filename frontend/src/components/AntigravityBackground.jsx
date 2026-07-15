import React, { useEffect, useRef } from 'react';

export const AntigravityBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas to window boundaries
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Mouse metrics tracker
    const mouse = {
      x: null,
      y: null,
      radius: 170 // Circle of influence
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Dynamic Particle blueprints
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1; // Size of dot
        this.speedX = Math.random() * 0.6 - 0.3;
        this.speedY = Math.random() * 0.6 - 0.3;
        
        // Colors matching green theme from HCL Guvi landing page mockup
        const greenShades = [
          'rgba(16, 185, 129, 0.45)', // Emerald Green
          'rgba(34, 197, 94, 0.45)',  // Standard Green
          'rgba(74, 222, 128, 0.45)',  // Light Neon Green
          'rgba(139, 92, 246, 0.15)'  // Violet hint
        ];
        this.color = greenShades[Math.floor(Math.random() * greenShades.length)];
      }

      update() {
        // Update position coordinates
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce on horizontal borders
        if (this.x < 0 || this.x > canvas.width) {
          this.speedX *= -1;
        }
        // Bounce on vertical borders
        if (this.y < 0 || this.y > canvas.height) {
          this.speedY *= -1;
        }

        // Mouse hover interaction: Attract dots to user mouse position
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.hypot(dx, dy);

          if (distance < mouse.radius) {
            // Apply slight gravitational force
            const force = (mouse.radius - distance) / mouse.radius;
            this.x += (dx / distance) * force * 1.6;
            this.y += (dy / distance) * force * 1.6;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        
        // Apply neon glow blur effects to green dots
        if (this.color.includes('16, 185, 129') || this.color.includes('34, 197, 94')) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#10b981';
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // Clear shadow
      }
    }

    // Set density particles by screen size
    const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 16000));
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Draw networking connection lines
    const connect = () => {
      for (let a = 0; a < particles.length; a++) {
        
        // Connection lines from dot to mouse cursor hover position
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - particles[a].x;
          const dy = mouse.y - particles[a].y;
          const dist = Math.hypot(dx, dy);
          
          if (dist < mouse.radius - 20) {
            const alpha = (1 - dist / mouse.radius) * 0.15;
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        // Connection lines between nearby floating dots
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.hypot(dx, dy);

          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.08;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    // Render loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw each particle
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // Connect adjacent nodes
      connect();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#040711' // Solid dark blue-black canvas backdrop
      }}
    />
  );
};

export default AntigravityBackground;
