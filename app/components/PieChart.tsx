import React, { useState, useEffect } from 'react';

type DataItem = {
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  data: DataItem[];
};

const AnimatedPieChart = ({ data }: DonutChartProps) => {
  const [progress, setProgress] = useState(0);
  const [scrambledValues, setScrambledValues] = useState(data.map(item => item.value));
  
  if (data.length !== 2) {
    throw new Error('AnimatedPieChart requires exactly 2 data items');
  }
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (Math.abs(total - 100) > 0.01) {
    throw new Error('Values must sum to 100');
  }

  useEffect(() => {
    let start: number | null = null;
    const duration = 3500;
    let scrambleInterval: number;

    scrambleInterval = window.setInterval(() => {
      if (progress < 100) {
        const random1 = Math.floor(Math.random() * 100);
        const random2 = 100 - random1;
        setScrambledValues([random1, random2]);
      }
    }, 50);

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const easeIn = (t: number) => t * t * t * t;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeIn(progress) * 100;
      setProgress(easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        clearInterval(scrambleInterval);
        setScrambledValues(data.map(item => item.value));
      }
    };

    requestAnimationFrame(animate);
    return () => clearInterval(scrambleInterval);
  }, []);

  const createArc = (startAngle: number, angleDiff: number, isClockwise: boolean) => {
    const r1 = 50; // outer radius
    const r2 = 20; // inner radius
    const cx = 50;
    const cy = 50;

    // Convert angles to radians and adjust for SVG coordinate system
    const start = (startAngle - 90) * Math.PI / 180;
    const end = (startAngle + (isClockwise ? angleDiff : -angleDiff) - 90) * Math.PI / 180;

    // Calculate points
    const x1 = cx + r1 * Math.cos(start);
    const y1 = cy + r1 * Math.sin(start);
    const x2 = cx + r1 * Math.cos(end);
    const y2 = cy + r1 * Math.sin(end);
    const x3 = cx + r2 * Math.cos(end);
    const y3 = cy + r2 * Math.sin(end);
    const x4 = cx + r2 * Math.cos(start);
    const y4 = cy + r2 * Math.sin(start);

    const largeArc = Math.abs(angleDiff) > 180 ? 1 : 0;
    const sweep = isClockwise ? 1 : 0;

    return [
      `M ${x1} ${y1}`,
      `A ${r1} ${r1} 0 ${largeArc} ${sweep} ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${r2} ${r2} 0 ${largeArc} ${1-sweep} ${x4} ${y4}`,
      'Z'
    ].join(' ');
  };

  const renderPieSegments = () => {
    const angle1 = (data[0].value / 100) * 360 * (progress / 100);
    const angle2 = (data[1].value / 100) * 360 * (progress / 100);

    return (
      <>
        <path
          d={createArc(0, angle1, true)}
          fill={data[0].color}
          className="transition-[d] duration-75 ease-out"
        />
        <path
          d={createArc(0, angle2, false)}
          fill={data[1].color}
          className="transition-[d] duration-75 ease-out"
        />
      </>
    );
  };

  return (
    <div className="w-full max-w-md p-4">
      <div className="relative">
        <svg viewBox="0 0 100 100" className="w-full">
          {renderPieSegments()}
        </svg>
      </div>
      
      <div className="mt-4 flex justify-center space-x-8">
        {data.map((segment, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: segment.color }}
            ></div>
            <span className="font-medium">
              {segment.label}: {scrambledValues[index].toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedPieChart;