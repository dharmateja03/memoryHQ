'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DOMAIN_COLORS, DOMAIN_LABELS, type CognitiveDomain } from '@/types';

interface RadarChartProps {
  data: {
    domain: CognitiveDomain;
    value: number;
  }[];
  size?: number;
  className?: string;
  showLabels?: boolean;
  animated?: boolean;
}

export function RadarChart({
  data,
  size = 300,
  className,
  showLabels = true,
  animated = true,
}: RadarChartProps) {
  const center = size / 2;
  const maxRadius = (size / 2) - 40; // Leave room for labels

  const points = useMemo(() => {
    const angleStep = (2 * Math.PI) / data.length;
    return data.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const radius = (item.value / 100) * maxRadius;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        labelX: center + (maxRadius + 25) * Math.cos(angle),
        labelY: center + (maxRadius + 25) * Math.sin(angle),
        domain: item.domain,
        value: item.value,
      };
    });
  }, [data, center, maxRadius]);

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Generate grid lines
  const gridLevels = [20, 40, 60, 80, 100];
  const gridPaths = gridLevels.map((level) => {
    const radius = (level / 100) * maxRadius;
    const gridPoints = data.map((_, index) => {
      const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      };
    });
    return gridPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  });

  // Generate axis lines
  const axisLines = data.map((_, index) => {
    const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
    return {
      x2: center + maxRadius * Math.cos(angle),
      y2: center + maxRadius * Math.sin(angle),
    };
  });

  return (
    <svg width={size} height={size} className={className}>
      {/* Grid */}
      {gridPaths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#213B5E"
          strokeWidth="1"
          opacity={0.5}
        />
      ))}

      {/* Axis lines */}
      {axisLines.map((line, i) => (
        <line
          key={i}
          x1={center}
          y1={center}
          x2={line.x2}
          y2={line.y2}
          stroke="#213B5E"
          strokeWidth="1"
          opacity={0.5}
        />
      ))}

      {/* Data polygon */}
      <motion.path
        d={pathD}
        fill="url(#radarGradient)"
        stroke="#3B82F6"
        strokeWidth="2"
        initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Data points */}
      {points.map((point, index) => (
        <motion.circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="6"
          fill={DOMAIN_COLORS[point.domain]}
          stroke="#0A1628"
          strokeWidth="2"
          initial={animated ? { opacity: 0, scale: 0 } : undefined}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        />
      ))}

      {/* Labels */}
      {showLabels && points.map((point, index) => (
        <g key={index}>
          <text
            x={point.labelX}
            y={point.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-300 text-xs font-medium"
          >
            {DOMAIN_LABELS[point.domain].split(' ')[0]}
          </text>
          <text
            x={point.labelX}
            y={point.labelY + 14}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white text-sm font-bold"
          >
            {point.value}
          </text>
        </g>
      ))}

      {/* Gradient definition */}
      <defs>
        <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}
