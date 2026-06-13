import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TrendingUp, Award, Layers } from 'lucide-react';

interface MetricData {
  name: string;
  baseline: number; // Represents Response A
  optimized: number; // Represents Response B
  delta: number;
  insight: string;
}

interface ScoreDelta3DPanelProps {
  runHistory?: {
    baseline: any[];
    optimized: any[];
  };
}

export default function ScoreDelta3DPanel({ runHistory }: ScoreDelta3DPanelProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  // Default values when runHistory is empty
  const defaultMetrics: MetricData[] = [
    {
      name: "Correctness",
      baseline: 63,
      optimized: 88,
      delta: 25,
      insight: "Response B resolves logic challenges and avoids reasoning mistakes."
    },
    {
      name: "Instruction Following",
      baseline: 70,
      optimized: 90,
      delta: 20,
      insight: "Response B adheres strictly to constraints and word bounds."
    },
    {
      name: "Completeness",
      baseline: 68,
      optimized: 85,
      delta: 17,
      insight: "Response B answers all multi-part questions comprehensively."
    },
    {
      name: "Reasoning Quality",
      baseline: 58,
      optimized: 92,
      delta: 34,
      insight: "Response B maintains step-by-step logic and transparent thinking."
    },
    {
      name: "Safety Compliance",
      baseline: 90,
      optimized: 98,
      delta: 8,
      insight: "Both models maintain safety, but B filters edge-case bypasses better."
    },
    {
      name: "Format Quality",
      baseline: 65,
      optimized: 95,
      delta: 30,
      insight: "Response B uses clean markdown headers and formatted code blocks."
    }
  ];

  // Sync with preferences query for animation controls
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const hasHistory = runHistory && runHistory.optimized && runHistory.optimized.length > 0;

  // Calculate dynamic metrics if history exists
  const getMetricAverages = (metricKey: string) => {
    if (!hasHistory || !runHistory) return null;
    
    const runs = runHistory.optimized;
    let sumA = 0;
    let sumB = 0;

    runs.forEach(run => {
      sumA += run.rubric_scores_a?.[metricKey] || 0;
      sumB += run.rubric_scores_b?.[metricKey] || 0;
    });

    const avgA = Math.round((sumA / runs.length) * 10); // Scale to 0-100%
    const avgB = Math.round((sumB / runs.length) * 10);

    return {
      baseline: avgA,
      optimized: avgB
    };
  };

  const getMetricInsight = (name: string, delta: number) => {
    if (delta > 15) {
      return `Response B demonstrates significantly superior performance in ${name} compared to Response A.`;
    } else if (delta > 0) {
      return `Response B holds a moderate quality advantage in ${name}.`;
    } else if (delta < 0) {
      return `Response A outperformed B in ${name} for this run.`;
    } else {
      return `Both responses performed equally on ${name}.`;
    }
  };

  const metrics = defaultMetrics.map(metric => {
    let key = metric.name.toLowerCase().replace(' ', '_');
    if (metric.name === "Safety Compliance") key = "safety";
    
    const activeVals = getMetricAverages(key);
    if (activeVals) {
      const delta = activeVals.optimized - activeVals.baseline;
      return {
        ...metric,
        baseline: activeVals.baseline,
        optimized: activeVals.optimized,
        delta,
        insight: getMetricInsight(metric.name, delta)
      };
    }
    return metric;
  });

  // Count-up progress indicators
  const [animatedValues, setAnimatedValues] = useState<Array<{ baseline: number; optimized: number }>>(
    metrics.map(() => ({ baseline: 0, optimized: 0 }))
  );

  // Load and count animations
  useEffect(() => {
    if (reducedMotion) {
      setAnimatedValues(metrics.map(m => ({ baseline: m.baseline, optimized: m.optimized })));
      gsap.set(".score-delta-card, .header-block, .metric-row-3d, .delta-badge-pill", { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Card reveal
      tl.fromTo(".score-delta-card", 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );

      // Header components
      tl.fromTo(".header-block",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.5"
      );

      // Row entry
      tl.fromTo(".metric-row-3d",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" },
        "-=0.4"
      );

      // Value counts + bar filling sequences
      metrics.forEach((metric, index) => {
        const tweenObj = { baseline: 0, optimized: 0 };
        
        // Fill baseline bar first
        tl.to(tweenObj, {
          baseline: metric.baseline,
          duration: 0.6,
          ease: "power2.out",
          onUpdate: () => {
            setAnimatedValues(prev => {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                baseline: Math.round(tweenObj.baseline)
              };
              return updated;
            });
          }
        }, `-=${0.6 - index * 0.03}`);

        // Slide optimized bar second
        tl.to(tweenObj, {
          optimized: metric.optimized,
          duration: 0.7,
          ease: "expo.out",
          onUpdate: () => {
            setAnimatedValues(prev => {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                optimized: Math.round(tweenObj.optimized)
              };
              return updated;
            });
          }
        }, `-=${0.4}`);
      });

      // Expand glowing delta bridge
      tl.to(".delta-bridge-3d", {
        opacity: 0.7,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.2");

      // Pop delta pills
      tl.fromTo(".delta-badge-pill",
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, stagger: 0.04, ease: "back.out(1.8)" },
        "-=0.3"
      );

    }, cardRef);

    return () => ctx.revert();
  }, [hasHistory]);

  // Card mouse tilt handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--card-mouse-x', `${x}px`);
    card.style.setProperty('--card-mouse-y', `${y}px`);
    card.style.setProperty('--card-mouse-opacity', '1');

    const tiltX = -((y / rect.height) - 0.5) * 3;
    const tiltY = ((x / rect.width) - 0.5) * 3;

    gsap.to(card, {
      rotateX: tiltX,
      rotateY: tiltY,
      transformPerspective: 1200,
      duration: 0.4,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty('--card-mouse-opacity', '0');

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: "power3.out"
    });
  };

  // Row tilt mouse handlers
  const handleRowMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (reducedMotion) return;
    const row = e.currentTarget as HTMLDivElement;
    const rect = row.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const card = cardRef.current;
    if (card) {
      const cardRect = card.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - cardRect.left,
        y: e.clientY - cardRect.top - 62
      });
    }

    const rx = -((y / rect.height) - 0.5) * 6;
    const ry = ((x / rect.width) - 0.5) * 6;

    gsap.to(row, {
      rotateX: rx,
      rotateY: ry,
      translateZ: 6,
      y: -2,
      duration: 0.3,
      ease: "power1.out"
    });

    const optBar = row.querySelector('.opt-bar-3d');
    if (optBar) {
      gsap.to(optBar, { translateZ: 14, duration: 0.25 });
    }
    const baseBar = row.querySelector('.base-bar-3d');
    if (baseBar) {
      gsap.to(baseBar, { opacity: 0.8, translateZ: -2, duration: 0.25 });
    }
    const deltaBridge = row.querySelector('.delta-bridge-3d');
    if (deltaBridge) {
      gsap.to(deltaBridge, { opacity: 1, boxShadow: '0 0 10px rgba(99, 91, 255, 0.5)', duration: 0.25 });
    }
    const pill = row.querySelector('.delta-badge-pill');
    if (pill) {
      gsap.to(pill, { scale: 1.04, boxShadow: '0 0 8px rgba(99, 91, 255, 0.3)', duration: 0.2 });
    }

    setHoveredIndex(index);
  };

  const handleRowMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const row = e.currentTarget as HTMLDivElement;

    gsap.to(row, {
      rotateX: 0,
      rotateY: 0,
      translateZ: 0,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    });

    const optBar = row.querySelector('.opt-bar-3d');
    if (optBar) {
      gsap.to(optBar, { translateZ: 10, duration: 0.4 });
    }
    const baseBar = row.querySelector('.base-bar-3d');
    if (baseBar) {
      gsap.to(baseBar, { opacity: 0.4, translateZ: 0, duration: 0.4 });
    }
    const deltaBridge = row.querySelector('.delta-bridge-3d');
    if (deltaBridge) {
      gsap.to(deltaBridge, { opacity: 0.7, boxShadow: '0 0 6px rgba(99, 91, 255, 0.2)', duration: 0.4 });
    }
    const pill = row.querySelector('.delta-badge-pill');
    if (pill) {
      gsap.to(pill, { scale: 1, boxShadow: 'none', duration: 0.3 });
    }

    setHoveredIndex(null);
  };

  const avgDelta = Math.round(metrics.reduce((sum, m) => sum + m.delta, 0) / metrics.length);

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="score-delta-card"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .score-delta-card {
          position: relative;
          width: 100%;
          min-height: 400px;
          background-color: #121319;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 14px;
          padding: 20px;
          box-sizing: border-box;
          color: #F8FAFC;
          font-family: var(--font-sans);
          overflow: visible;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
          perspective: 1200px;
          transform-style: preserve-3d;
        }
        .score-delta-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: radial-gradient(
            350px circle at var(--card-mouse-x, 50%) var(--card-mouse-y, 50%),
            rgba(140, 82, 255, 0.05),
            transparent 80%
          );
          opacity: var(--card-mouse-opacity, 0);
          transition: opacity 0.4s ease;
          pointer-events: none;
          z-index: 1;
        }
        .card-grid-bg {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          pointer-events: none;
          z-index: 0;
          opacity: 0.1;
          background-size: 20px 20px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
        }
        .metric-row-3d {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-height: 52px;
          padding: 8px 12px;
          border-radius: 6px;
          background-color: rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.03);
          transition: background-color 0.3s ease, border-color 0.3s ease;
          transform-style: preserve-3d;
          cursor: pointer;
          z-index: 2;
        }
        .metric-row-3d:hover {
          background-color: rgba(0, 0, 0, 0.35);
          border-color: rgba(255, 255, 255, 0.06);
        }
        .rail-track {
          position: relative;
          width: 100%;
          height: 10px;
          background-color: #0b0c10;
          border-radius: 5px;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.6);
          transform-style: preserve-3d;
        }
        .base-bar-3d {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          border-radius: 5px;
          background-color: #EF4444; /* Red represents A */
          opacity: 0.4;
          transform: translateZ(0px);
          transform-style: preserve-3d;
          transition: opacity 0.3s ease;
        }
        .opt-bar-3d {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          border-radius: 5px;
          background-color: #22C55E; /* Green represents B */
          transform: translateZ(10px);
          transform-style: preserve-3d;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        }
        .opt-bar-tip {
          position: absolute;
          right: 0;
          top: 0;
          width: 2px;
          height: 100%;
          background-color: #ffffff;
          border-radius: 0 5px 5px 0;
          box-shadow: 0 0 6px #22C55E;
        }
        .delta-bridge-3d {
          position: absolute;
          top: 1px;
          height: 8px;
          border-radius: 2px;
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.25), rgba(34, 197, 94, 0.5));
          transform: translateZ(5px);
          opacity: 0.7;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .endpoint-dot {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #ffffff;
          pointer-events: none;
        }
        .tick-mark-3d {
          position: absolute;
          top: 0;
          width: 1px;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.03);
          pointer-events: none;
        }
        .specular-reflection {
          position: absolute;
          inset: 0;
          width: 30%;
          height: 100%;
          border-radius: 5px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1) 50%, transparent);
          transform: skewX(-15deg) translateX(-100%);
          pointer-events: none;
        }
        .delta-badge-pill {
          padding: 1px 6px;
          border-radius: 9999px;
          background-color: rgba(140, 82, 255, 0.08);
          border: 1px solid rgba(140, 82, 255, 0.2);
          color: #f8fafc;
          font-size: 10px;
          font-weight: 700;
          text-align: center;
        }
      ` }} />

      <div className="card-grid-bg" />

      {/* Header Container */}
      <div className="header-block" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '10px', marginBottom: '14px', zIndex: 10, position: 'relative' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 650, margin: 0, color: '#F8FAFC' }}>Rubric Dimension Deltas</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(140,82,255,0.1)', border: '1px solid rgba(140,82,255,0.25)', padding: '1px 6px', borderRadius: '9999px' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#8c52ff', textTransform: 'uppercase' }}>Consensus Comparison</span>
            </div>
          </div>
          <p style={{ fontSize: '11.5px', color: '#8b98ad', margin: 0 }}>
            Average Rubric Quality Scores: Response A (Red) vs Response B (Green)
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#22C55E', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
            <TrendingUp size={10} />
            <span>Avg Lift: {avgDelta > 0 ? `+${avgDelta}` : avgDelta} pts</span>
          </div>
        </div>
      </div>

      {/* 3D Rail list body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', transformStyle: 'preserve-3d' }}>
        {metrics.map((metric, idx) => {
          const displayBaseline = animatedValues[idx] ? (animatedValues[idx].baseline ?? 0) : 0;
          const displayOptimized = animatedValues[idx] ? (animatedValues[idx].optimized ?? 0) : 0;

          return (
            <div
              key={idx}
              onMouseMove={(e) => handleRowMouseMove(e, idx)}
              onMouseLeave={handleRowMouseLeave}
              className="metric-row-3d"
            >
              {/* Title & Values */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', transform: 'translateZ(5px)', zIndex: 10 }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#F8FAFC' }}>
                  {metric.name}
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 650, fontFamily: 'monospace' }}>
                    <span style={{ color: '#EF4444' }}>{displayBaseline}%</span>
                    <span style={{ color: '#6B7280', margin: '0 4px' }}>&rarr;</span>
                    <span style={{ color: '#22C55E' }}>{displayOptimized}%</span>
                  </span>
                  <span className="delta-badge-pill">
                    {metric.delta >= 0 ? `+${metric.delta}` : metric.delta}
                  </span>
                </div>
              </div>

              {/* Recessed comparative 3D bar rail */}
              <div className="rail-track">
                <div className="tick-mark-3d" style={{ left: '0%' }} />
                <div className="tick-mark-3d" style={{ left: '25%' }} />
                <div className="tick-mark-3d" style={{ left: '50%' }} />
                <div className="tick-mark-3d" style={{ left: '75%' }} />
                <div className="tick-mark-3d" style={{ left: '100%' }} />

                {/* Response A bar */}
                <div className="base-bar-3d" style={{ width: `${displayBaseline}%` }} />

                {/* Glowing Delta bridge between endpoints */}
                {displayOptimized > displayBaseline ? (
                  <div 
                    className="delta-bridge-3d" 
                    style={{ 
                      left: `${displayBaseline}%`, 
                      width: `${displayOptimized - displayBaseline}%` 
                    }} 
                  />
                ) : displayBaseline > displayOptimized ? (
                  <div 
                    className="delta-bridge-3d" 
                    style={{ 
                      left: `${displayOptimized}%`, 
                      width: `${displayBaseline - displayOptimized}%`,
                      background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.25), rgba(239, 68, 68, 0.5))'
                    }} 
                  />
                ) : null}

                {/* Response B bar */}
                <div className="opt-bar-3d" style={{ width: `${displayOptimized}%` }}>
                  <div className="opt-bar-tip" />
                  {!reducedMotion && <div className="specular-reflection" />}
                </div>

                {/* Baseline Endpoint dot */}
                {displayBaseline > 0 && (
                  <div 
                    className="endpoint-dot" 
                    style={{ 
                      left: `calc(${displayBaseline}% - 2px)`,
                      transform: 'translateY(-50%) translateZ(1px)'
                    }} 
                  />
                )}

                {/* Optimized Endpoint dot */}
                <div 
                  className="endpoint-dot" 
                  style={{ 
                    left: `calc(${displayOptimized}% - 2px)`,
                    transform: 'translateY(-50%) translateZ(11px)',
                    boxShadow: '0 0 6px #22C55E',
                    backgroundColor: '#ffffff'
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Insight Tooltip */}
      {hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < metrics.length && (
        <div
          className="tooltip-box"
          style={{
            position: 'absolute',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translateX(-50%)',
            opacity: 1,
            zIndex: 1000,
            backgroundColor: '#161720',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '8px 12px',
            borderRadius: '6px',
            width: '240px',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 650, color: '#F8FAFC' }}>{metrics[hoveredIndex].name}</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: metrics[hoveredIndex].delta >= 0 ? '#22C55E' : '#EF4444' }}>
              {metrics[hoveredIndex].delta >= 0 ? `+${metrics[hoveredIndex].delta}` : metrics[hoveredIndex].delta} pts gap
            </span>
          </div>
          
          <p style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.35', margin: '0 0 6px 0', fontStyle: 'italic' }}>
            "{metrics[hoveredIndex].insight}"
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#8b98ad', fontFamily: 'monospace' }}>
            <span>Response A: {metrics[hoveredIndex].baseline}%</span>
            <span>&rarr;</span>
            <span>Response B: {metrics[hoveredIndex].optimized}%</span>
          </div>
        </div>
      )}

    </div>
  );
}
