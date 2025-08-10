import { ReactFlowProvider } from '@xyflow/react';
import MindMap from './components/Mindmap';

const MindmapPage = () => {
  return (
    <ReactFlowProvider>
      <MindMap />
    </ReactFlowProvider>
  );
};

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Position,
} from '@xyflow/react';
import * as d3 from 'd3';

import '@xyflow/react/dist/style.css';

const initialNodes = [
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 100 },
    data: { label: 'Node 1' },
  },
  {
    id: '2',
    type: 'default',
    position: { x: 100, y: 200 },
    data: { label: 'Node 2' },
  },
  {
    id: '3',
    type: 'default',
    position: { x: 400, y: 200 },
    data: { label: 'Node 3' },
  },
  {
    id: '4',
    type: 'default',
    position: { x: 250, y: 300 },
    data: { label: 'Node 4' },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e3-4', source: '3', target: '4' },
];

const AnimatedFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef(null);
  const animationDataRef = useRef([]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Function to animate nodes to new positions
  const animateNodesToPositions = useCallback(
    (targetPositions, duration = 2000) => {
      if (timerRef.current) {
        timerRef.current.stop();
      }

      // Store initial positions and calculate deltas
      animationDataRef.current = nodes.map((node) => {
        const target = targetPositions[node.id];
        return {
          id: node.id,
          startPos: { ...node.position },
          targetPos: target || node.position,
          deltaX: (target?.x || node.position.x) - node.position.x,
          deltaY: (target?.y || node.position.y) - node.position.y,
        };
      });

      const startTime = Date.now();
      setIsAnimating(true);

      timerRef.current = d3.timer((elapsed) => {
        const progress = Math.min(elapsed / duration, 1);

        // Use easing function for smoother animation
        const easedProgress = d3.easeCubicInOut(progress);

        setNodes((currentNodes) =>
          currentNodes.map((node) => {
            const animData = animationDataRef.current.find((d) => d.id === node.id);
            if (!animData) return node;

            const newX = animData.startPos.x + animData.deltaX * easedProgress;
            const newY = animData.startPos.y + animData.deltaY * easedProgress;

            return {
              ...node,
              position: { x: newX, y: newY },
            };
          })
        );

        // Stop animation when complete
        if (progress >= 1) {
          timerRef.current.stop();
          setIsAnimating(false);
        }
      });
    },
    [nodes, setNodes]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        timerRef.current.stop();
      }
    };
  }, []);

  // Animation presets
  const animateToCircle = useCallback(() => {
    const centerX = 300;
    const centerY = 200;
    const radius = 120;
    const angleStep = (2 * Math.PI) / nodes.length;

    const targetPositions = {};
    nodes.forEach((node, index) => {
      const angle = index * angleStep;
      targetPositions[node.id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    });

    animateNodesToPositions(targetPositions);
  }, [nodes, animateNodesToPositions]);

  const animateToLine = useCallback(() => {
    const startX = 100;
    const startY = 200;
    const spacing = 150;

    const targetPositions = {};
    nodes.forEach((node, index) => {
      targetPositions[node.id] = {
        x: startX + index * spacing,
        y: startY,
      };
    });

    animateNodesToPositions(targetPositions);
  }, [nodes, animateNodesToPositions]);

  const animateToGrid = useCallback(() => {
    const startX = 150;
    const startY = 100;
    const spacing = 150;
    const cols = 2;

    const targetPositions = {};
    nodes.forEach((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      targetPositions[node.id] = {
        x: startX + col * spacing,
        y: startY + row * spacing,
      };
    });

    animateNodesToPositions(targetPositions);
  }, [nodes, animateNodesToPositions]);

  const animateRandomly = useCallback(() => {
    const targetPositions = {};
    nodes.forEach((node) => {
      targetPositions[node.id] = {
        x: Math.random() * 500 + 50,
        y: Math.random() * 400 + 50,
      };
    });

    animateNodesToPositions(targetPositions, 1500);
  }, [nodes, animateNodesToPositions]);

  const stopAnimation = useCallback(() => {
    if (timerRef.current) {
      timerRef.current.stop();
      setIsAnimating(false);
    }
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 4,
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={animateToCircle}
          disabled={isAnimating}
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: isAnimating ? '#f0f0f0' : 'white',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
          }}
        >
          Circle
        </button>
        <button
          onClick={animateToLine}
          disabled={isAnimating}
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: isAnimating ? '#f0f0f0' : 'white',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
          }}
        >
          Line
        </button>
        <button
          onClick={animateToGrid}
          disabled={isAnimating}
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: isAnimating ? '#f0f0f0' : 'white',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
          }}
        >
          Grid
        </button>
        <button
          onClick={animateRandomly}
          disabled={isAnimating}
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: isAnimating ? '#f0f0f0' : 'white',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
          }}
        >
          Random
        </button>
        <button
          onClick={stopAnimation}
          disabled={!isAnimating}
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: !isAnimating ? '#f0f0f0' : '#ffebee',
            cursor: !isAnimating ? 'not-allowed' : 'pointer',
            color: !isAnimating ? '#999' : '#d32f2f',
          }}
        >
          Stop
        </button>
        {isAnimating && (
          <span
            style={{
              padding: '8px 12px',
              color: '#1976d2',
              fontWeight: 'bold',
            }}
          >
            Animating...
          </span>
        )}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default { MindmapPage, AnimatedFlow };
