# Mindmap Export Dialog Implementation Plan

**Project**: DATN Frontend - Mindmap Feature
**Issue**: DATN-298: Replace DownloadButton with Export Dialog
**Branch**: `feat/datn-298/export-mindmap`
**Date**: November 18, 2025

## 📋 Overview

Replace the current `DownloadButton` component with a comprehensive export dialog supporting multiple formats (PNG, JPG, SVG, and PDF), following the design patterns established in the presentation module's `ExportDialog`.

### Current State
- **File**: `/container/src/features/mindmap/components/controls/DownloadButton.tsx`
- **Current Capability**: PNG export using `html-to-image`
- **Limitation**: Single format, no configuration options

### Target State
- Multi-format export dialog with tabs (PNG, JPG, SVG, PDF)
- Format-specific configuration panels
- Consistent UI with presentation module ExportDialog
- Full i18n support
- Preview/preview information

---

## 🎯 Phase 1: Analysis & Planning

### Task 1.1: Analyze Mindmap Export Requirements

**Objective**: Understand the current export implementation and identify requirements for all formats.

**Subtasks**:
1. Review current `DownloadButton.tsx` implementation
   - Current dimensions: 2048x2048px
   - Current export method: `html-to-image` → `toPng()`
   - Current viewport selector: `.react-flow__viewport`
   - Current styling: white background, skipFonts: true

2. Identify React Flow API capabilities
   - Use `getNodes()` and `getNodesBounds()` to calculate bounds
   - Use `getViewportForBounds()` for viewport positioning
   - Understand viewport transform and zoom calculations

3. Define format-specific requirements:
   - **PNG**: Same as current (2048x2048, white bg, skipFonts)
   - **JPG**: Similar to PNG but with quality settings (0-1)
   - **SVG**: Need custom SVG generation or React Flow export utility
   - **PDF**: Need pdf generation library (possibly jsPDF or html2pdf)

4. Check dependency availability:
   - ✅ `html-to-image` (v1.11.11) - already installed
   - ❓ `jsPDF` or `html2pdf` - may need installation for PDF export
   - ❓ SVG export utilities - check React Flow documentation

**Deliverable**: Understanding of current implementation and requirements document

---

### Task 1.2: Create Export Configuration Interface

**Objective**: Define TypeScript types for all export configurations.

**File**: `/container/src/features/mindmap/types/export.ts` (new file)

**Required Types**:

```typescript
// Shared export options
export interface ExportDimensions {
  width: number;
  height: number;
}

export interface BaseExportOptions {
  backgroundColor?: string;
  skipFonts?: boolean;
  dimensions: ExportDimensions;
}

// Format-specific options
export interface PNGExportOptions extends BaseExportOptions {
  format: 'png';
}

export interface JPGExportOptions extends BaseExportOptions {
  format: 'jpg';
  quality: number; // 0-1
}

export interface SVGExportOptions extends BaseExportOptions {
  format: 'svg';
  strokeColor?: string;
}

export interface PDFExportOptions extends BaseExportOptions {
  format: 'pdf';
  orientation?: 'portrait' | 'landscape';
  paperSize?: 'a4' | 'letter';
}

export type ExportOptions = 
  | PNGExportOptions 
  | JPGExportOptions 
  | SVGExportOptions 
  | PDFExportOptions;

export type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf';
```

**Deliverable**: `export.ts` with all type definitions

---

## 🎨 Phase 2: Component Architecture

### Task 2.1: Create ExportMindmapDialog Component Structure

**Objective**: Create the main dialog component with tab navigation.

**File**: `/container/src/features/mindmap/components/ExportDialog/index.tsx` (new file)

**Component Structure**:

```
ExportMindmapDialog (Main Container)
├── Dialog (Radix UI)
│   ├── DialogContent
│   │   ├── DialogHeader
│   │   │   └── DialogTitle
│   │   └── Tabs
│   │       ├── TabsList
│   │       │   ├── TabsTrigger (PNG)
│   │       │   ├── TabsTrigger (JPG)
│   │       │   ├── TabsTrigger (SVG)
│   │       │   └── TabsTrigger (PDF)
│   │       ├── TabsContent (PNG) → ExportImageTab
│   │       ├── TabsContent (JPG) → ExportImageTab
│   │       ├── TabsContent (SVG) → ExportSVGTab
│   │       └── TabsContent (PDF) → ExportPDFTab
```

**Props Interface**:

```typescript
interface ExportMindmapDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Features**:
- Tabbed interface for all formats
- Modal dialog using shadcn/ui Dialog component
- Responsive layout
- Close button functionality
- Proper state management

**Deliverable**: Main dialog component with tabs structure

---

### Task 2.2: Create Shared Export Utilities

**Objective**: Create reusable utilities for export functionality.

**File**: `/container/src/features/mindmap/utils/exportUtils.ts` (new file)

**Utilities to Implement**:

```typescript
// Get mindmap viewport element
export function getMindmapViewport(): HTMLElement | null

// Calculate optimal dimensions for export
export function calculateExportDimensions(
  viewport: HTMLElement,
  format: ExportFormat
): ExportDimensions

// Generate filename with timestamp
export function generateFilename(format: ExportFormat): string

// Download file helper
export function downloadFile(
  dataUrl: string,
  filename: string
): void
```

**Deliverable**: `exportUtils.ts` with reusable functions

---

## 📦 Phase 3: Format-Specific Implementations

### Task 3.1: Implement PNG Export Tab

**Objective**: Create PNG export configuration and export logic.

**File**: `/container/src/features/mindmap/components/ExportDialog/ExportImageTab.tsx` (new file)

**Configuration Options**:
- ✅ Background color (color picker or preset)
- ✅ Skip fonts toggle (checkbox)
- ✅ Image dimensions (preset options: 1024x1024, 2048x2048, 4096x4096)

**UI Components**:
- Left panel: Configuration options + Export/Cancel buttons
- Right panel: Preview/information panel

**Export Logic**:
1. Get mindmap viewport bounds using React Flow API
2. Calculate viewport transform for optimal framing
3. Use `html-to-image` library to export as PNG
4. Download file with timestamp

**Deliverable**: ExportImageTab component handling PNG export

---

### Task 3.2: Implement JPG Export Tab

**Objective**: Create JPG export configuration and export logic.

**File**: Reuse `ExportImageTab.tsx` with JPG-specific options

**Configuration Options** (extends PNG):
- ✅ Background color
- ✅ Skip fonts toggle
- ✅ Image dimensions
- **NEW**: Quality slider (0-100%)

**UI Adjustments**:
- Add quality slider below dimension options
- Show quality percentage indicator

**Export Logic**:
1. Same as PNG but use `toPng()` with JPG format conversion
2. Apply quality setting to export
3. Download with JPG extension

**Alternative Approach**:
- If `html-to-image` doesn't directly support JPG, use Canvas API:
  - Export as PNG first
  - Convert to JPG using `canvas.toDataURL('image/jpeg', quality)`

**Deliverable**: JPG export functionality in ExportImageTab

---

### Task 3.3: Implement SVG Export Tab

**Objective**: Create SVG export functionality.

**File**: `/container/src/features/mindmap/components/ExportDialog/ExportSVGTab.tsx` (new file)

**Research Required**:
- Check React Flow documentation for SVG export capabilities
- Investigate `@xyflow/react` utilities for SVG generation
- Consider custom SVG generation if built-in support unavailable

**Configuration Options**:
- ✅ Stroke color (for node borders/edges)
- ✅ Include background toggle
- ✅ Dimensions

**Export Logic** (Approach 1 - Custom):
1. Get all nodes and edges from React Flow
2. Generate SVG markup manually:
   - Create SVG element with calculated dimensions
   - Render nodes as SVG circles/rectangles with labels
   - Render edges as SVG paths
   - Apply styling (colors, strokes, etc.)
3. Create blob and download

**Export Logic** (Approach 2 - Built-in):
1. Use React Flow's built-in SVG export if available
2. Apply custom styling if needed
3. Download

**Deliverable**: ExportSVGTab component with SVG export

---

### Task 3.4: Implement PDF Export Tab

**Objective**: Create PDF export functionality.

**File**: `/container/src/features/mindmap/components/ExportDialog/ExportPDFTab.tsx` (new file)

**Dependency Check**:
- Check if `jsPDF` or `html2pdf` is already in dependencies
- If not, determine which to install:
  - `jsPDF` (smaller, more control)
  - `html2pdf` (simpler, wraps html2canvas + jsPDF)

**Configuration Options**:
- ✅ Orientation (portrait/landscape)
- ✅ Paper size (A4, Letter, Custom)
- ✅ Include margins toggle
- ✅ Background color

**Export Logic**:
1. Get mindmap viewport as image (use html-to-image)
2. Create PDF document with selected paper size
3. Add image to PDF with proper scaling
4. Add metadata (title, creation date)
5. Download PDF

**Deliverable**: ExportPDFTab component with PDF export

---

## 🔄 Phase 4: Integration & Localization

### Task 4.1: Replace DownloadButton with Export Dialog

**Objective**: Update the DownloadButton to trigger the new export dialog.

**File**: `/container/src/features/mindmap/components/controls/DownloadButton.tsx` (modify)

**Changes**:

```typescript
// Before:
function DownloadButton({ className }: { className?: string }) {
  const { getNodes } = useReactFlow();
  const onClick = () => {
    // Inline export logic
    ...
  };
  return (
    <Button variant={'outline'} onClick={onClick} className={className}>
      Download Image
    </Button>
  );
}

// After:
function DownloadButton({ className }: { className?: string }) {
  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false);

  return (
    <>
      <Button 
        variant={'outline'} 
        onClick={() => setIsExportDialogOpen(true)} 
        className={className}
      >
        Export
      </Button>
      <ExportMindmapDialog 
        isOpen={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
      />
    </>
  );
}
```

**Considerations**:
- Keep button as entry point
- Move all export logic to ExportDialog components
- Maintain same styling and position
- Update button text to "Export" (more descriptive)

**Deliverable**: Updated DownloadButton with dialog integration

---

### Task 4.2: Add i18n Translations

**Objective**: Create translation keys for the export dialog.

**Files to Update**:
- `/container/src/shared/i18n/locales/en/common.json` (or similar structure)
- `/container/src/shared/i18n/locales/[other-languages]/common.json`

**Translation Keys** (Suggested Structure):

```json
{
  "mindmap": {
    "export": {
      "title": "Export Mindmap",
      "formats": {
        "png": "PNG Image",
        "jpg": "JPG Image",
        "svg": "SVG Vector",
        "pdf": "PDF Document"
      },
      "common": {
        "backgroundColor": "Background Color",
        "white": "White",
        "transparent": "Transparent",
        "dimensions": "Dimensions",
        "skipFonts": "Skip Web Fonts",
        "export": "Export",
        "cancel": "Cancel",
        "exporting": "Exporting..."
      },
      "image": {
        "quality": "Quality",
        "width": "Width",
        "height": "Height"
      },
      "svg": {
        "strokeColor": "Stroke Color",
        "includeBackground": "Include Background"
      },
      "pdf": {
        "orientation": "Orientation",
        "portrait": "Portrait",
        "landscape": "Landscape",
        "paperSize": "Paper Size",
        "margins": "Include Margins"
      }
    }
  }
}
```

**Deliverable**: Complete i18n translation keys for all languages

## 📊 File Structure

**New Files to Create**:

```
container/src/features/mindmap/
├── components/
│   ├── ExportDialog/
│   │   ├── index.tsx (Main dialog component)
│   │   ├── ExportImageTab.tsx (PNG & JPG)
│   │   ├── ExportSVGTab.tsx (SVG export)
│   │   ├── ExportPDFTab.tsx (PDF export)
│   │   └── ExportDialog.module.css (Optional styling)
│   └── controls/
│       └── DownloadButton.tsx (Modified)
├── types/
│   └── export.ts (Type definitions)
└── utils/
    └── exportUtils.ts (Shared utilities)
```

**Modified Files**:
- `controls/DownloadButton.tsx`
- i18n translation files (all languages)

---

## 🔧 Technology Stack

| Technology | Purpose | Status |
|-----------|---------|--------|
| React 19.1.0 | UI Framework | ✅ Installed |
| TypeScript 5.8.3 | Type Safety | ✅ Installed |
| Tailwind CSS 4.1.11 | Styling | ✅ Installed |
| shadcn/ui | Dialog/Tabs/Button | ✅ Installed |
| @xyflow/react 12.8.2 | Mindmap Logic | ✅ Installed |
| html-to-image 1.11.11 | Image Export | ✅ Installed |
| jsPDF | PDF Export | ⏳ To Be Installed |
| i18next 25.3.2 | Localization | ✅ Installed |

---

## 📈 Dependencies to Install (If Needed)

```bash
# PDF export support
pnpm install jspdf html2canvas

# Or use html2pdf if preferred
pnpm install html2pdf.js
```

---

## ✅ Acceptance Criteria

- [ ] ExportMindmapDialog component created with proper structure
- [ ] PNG export working with configurable dimensions and background
- [ ] JPG export working with quality settings
- [ ] SVG export producing valid SVG files
- [ ] PDF export supporting multiple paper sizes and orientations
- [ ] All export formats working without errors
- [ ] i18n translations added for all supported languages
- [ ] DownloadButton updated to use new dialog
- [ ] No TypeScript errors or warnings
- [ ] Files downloaded with correct names and timestamps
- [ ] UI consistent with presentation module ExportDialog
- [ ] All tests passing

---

## 🚀 Implementation Order

1. **Week 1 - Foundation**:
   - Complete Task 1.1 & 1.2 (Analysis & Types)
   - Complete Task 2.1 & 2.2 (Component Architecture)

2. **Week 1-2 - Format Implementations**:
   - Complete Task 3.1 (PNG Export)
   - Complete Task 3.2 (JPG Export)
   - Complete Task 3.3 (SVG Export)
   - Complete Task 3.4 (PDF Export)

3. **Week 2 - Integration**:
   - Complete Task 4.1 (Replace DownloadButton)
   - Complete Task 4.2 (i18n Translations)

---

## 📝 Notes

- Follow the existing code style in the container app
- Use shadcn/ui components for consistency
- Leverage existing i18n infrastructure
- Consider performance for large mindmaps
- Test across different browsers
- Add proper error handling and user feedback

---

## 🔗 Related Files & References

**Current Implementation**:
- `/container/src/features/mindmap/components/controls/DownloadButton.tsx`

**Reference Implementations**:
- `/presentation/src/views/Editor/ExportDialog/index.vue`
- `/presentation/src/views/Editor/ExportDialog/ExportImage.vue`
- `/presentation/src/views/Editor/ExportDialog/ExportPDF.vue`

**UI Components**:
- `/container/src/shared/components/ui/dialog.tsx`
- `/container/src/shared/components/ui/tabs.tsx`
- `/container/src/shared/components/ui/button.tsx`

**Existing Dialogs**:
- `/container/src/shared/components/modals/RenameFileDialog.tsx`

---

## 📞 Contact & Questions

- **Branch**: `feat/datn-298/export-mindmap`
- **Related Issue**: DATN-298
- **Last Updated**: November 18, 2025
