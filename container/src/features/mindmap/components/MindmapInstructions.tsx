const MindmapInstructions = () => {
  return (
    <div className="absolute right-4 top-4 z-10 max-w-xs">
      <div
        className="rounded-lg p-4 text-sm shadow-md"
        style={{
          backgroundColor: 'var(--card)',
          color: 'var(--card-foreground)',
          border: '1px solid var(--border)',
        }}
      >
        <h3 className="mb-2 font-semibold">How to use:</h3>
        <ul className="space-y-1 text-xs">
          <li>• Drag nodes to reposition</li>
          <li>• Click a node and drag from handles to connect</li>
          <li>• Double-click node text to edit</li>
          <li>• Select nodes and press Delete key or use button</li>
          <li>• Use mouse wheel to zoom and pan</li>
          <li>
            • <strong>Ctrl+A:</strong> Select all nodes and edges
          </li>
          <li>
            • <strong>Ctrl+C:</strong> Copy selected nodes/edges
          </li>
          <li>
            • <strong>Ctrl+V:</strong> Paste at mouse position
          </li>
          <li>• Click "Add Node" to create new nodes</li>
          <li>• Multiple nodes can be selected together</li>
        </ul>
      </div>
    </div>
  );
};

export default MindmapInstructions;
