import { customAlphabet } from 'nanoid';
import { defineStore } from 'pinia';
import { ToolbarStates } from '@/types/toolbar';
import type { CreatingElement, ShapeFormatPainter, TextFormatPainter } from '@/types/edit';
import type { DialogForExportTypes } from '@/types/export';
import { type TextAttrs, defaultRichTextAttrs } from '@/utils/prosemirror/utils';

import { useSlidesStore } from './slides';

export interface MainState {
  activeElementIdList: string[];
  handleElementId: string;
  activeGroupElementId: string;
  hiddenElementIdList: string[];
  canvasPercentage: number;
  canvasScale: number;
  canvasDragged: boolean;
  thumbnailsFocus: boolean;
  editorAreaFocus: boolean;
  disableHotkeys: boolean;
  gridLineSize: number;
  showRuler: boolean;
  creatingElement: CreatingElement | null;
  creatingCustomShape: boolean;
  toolbarState: ToolbarStates;
  clipingImageElementId: string;
  isScaling: boolean;
  richTextAttrs: TextAttrs;
  selectedTableCells: string[];
  selectedSlidesIndex: number[];
  dialogForExport: DialogForExportTypes;
  databaseId: string;
  textFormatPainter: TextFormatPainter | null;
  shapeFormatPainter: ShapeFormatPainter | null;
  showSelectPanel: boolean;
  showSearchPanel: boolean;
  showNotesPanel: boolean;
  showSymbolPanel: boolean;
  showMarkupPanel: boolean;
  showImageLibPanel: boolean;
  sidebarExpanded: boolean;
}

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
export const databaseId = nanoid(10);

export const useMainStore = defineStore('main', {
  state: (): MainState => ({
    activeElementIdList: [], // Collection of selected element IDs, includes handleElementId
    handleElementId: '', // ID of the element currently being operated on
    activeGroupElementId: '', // ID of the element in a group that can be operated on independently
    hiddenElementIdList: [], // Collection of hidden element IDs
    canvasPercentage: 90, // Canvas visible area percentage
    canvasScale: 1, // Canvas zoom ratio (based on width {{slidesStore.viewportSize}} pixels)
    canvasDragged: false, // Canvas is being dragged and moved
    thumbnailsFocus: false, // Left navigation thumbnail area focused
    editorAreaFocus: false, //  Editor area focused
    disableHotkeys: false, // Disable hotkeys
    gridLineSize: 0, // Grid line size (0 means no grid lines displayed)
    showRuler: false, // Show ruler
    creatingElement: null, // Information about the element being inserted, elements that need to be inserted through drawing (text, shape, line)
    creatingCustomShape: false, // Drawing arbitrary polygon
    toolbarState: ToolbarStates.SLIDE_DESIGN, // Right toolbar state
    clipingImageElementId: '', // ID of the image currently being cropped
    richTextAttrs: defaultRichTextAttrs, // Rich text state
    selectedTableCells: [], // Selected table cells
    isScaling: false, // Element scaling in progress
    selectedSlidesIndex: [], // Collection of currently selected page indices
    dialogForExport: '', // Export panel
    databaseId, // IndexedDB database ID for current application
    textFormatPainter: null, // Text format painter
    shapeFormatPainter: null, // Shape format painter
    showSelectPanel: false, // Open selection panel
    showSearchPanel: false, // Open find and replace panel
    showNotesPanel: false, // Open annotation panel
    showSymbolPanel: false, // Open symbol panel
    showMarkupPanel: false, // Open type annotation panel
    showImageLibPanel: false, // Open image library panel
    sidebarExpanded: false, // Sidebar panel expansion state
  }),

  getters: {
    activeElementList(state) {
      const slidesStore = useSlidesStore();
      const currentSlide = slidesStore.currentSlide;
      if (!currentSlide || !currentSlide.elements) return [];
      return currentSlide.elements.filter((element) => state.activeElementIdList.includes(element.id));
    },

    handleElement(state) {
      const slidesStore = useSlidesStore();
      const currentSlide = slidesStore.currentSlide;
      if (!currentSlide || !currentSlide.elements) return null;
      return currentSlide.elements.find((element) => state.handleElementId === element.id) || null;
    },
  },

  actions: {
    setActiveElementIdList(activeElementIdList: string[]) {
      if (activeElementIdList.length === 1) this.handleElementId = activeElementIdList[0];
      else this.handleElementId = '';

      this.activeElementIdList = activeElementIdList;
    },

    setHandleElementId(handleElementId: string) {
      this.handleElementId = handleElementId;
    },

    setActiveGroupElementId(activeGroupElementId: string) {
      this.activeGroupElementId = activeGroupElementId;
    },

    setHiddenElementIdList(hiddenElementIdList: string[]) {
      this.hiddenElementIdList = hiddenElementIdList;
    },

    setCanvasPercentage(percentage: number) {
      this.canvasPercentage = percentage;
    },

    setCanvasScale(scale: number) {
      this.canvasScale = scale;
    },

    setCanvasDragged(isDragged: boolean) {
      this.canvasDragged = isDragged;
    },

    setThumbnailsFocus(isFocus: boolean) {
      this.thumbnailsFocus = isFocus;
    },

    setEditorareaFocus(isFocus: boolean) {
      this.editorAreaFocus = isFocus;
    },

    setDisableHotkeysState(disable: boolean) {
      this.disableHotkeys = disable;
    },

    setGridLineSize(size: number) {
      this.gridLineSize = size;
    },

    setRulerState(show: boolean) {
      this.showRuler = show;
    },

    setCreatingElement(element: CreatingElement | null) {
      this.creatingElement = element;
    },

    setCreatingCustomShapeState(state: boolean) {
      this.creatingCustomShape = state;
    },

    setToolbarState(toolbarState: ToolbarStates) {
      this.toolbarState = toolbarState;
    },

    setClipingImageElementId(elId: string) {
      this.clipingImageElementId = elId;
    },

    setRichtextAttrs(attrs: TextAttrs) {
      this.richTextAttrs = attrs;
    },

    setSelectedTableCells(cells: string[]) {
      this.selectedTableCells = cells;
    },

    setScalingState(isScaling: boolean) {
      this.isScaling = isScaling;
    },

    updateSelectedSlidesIndex(selectedSlidesIndex: number[]) {
      this.selectedSlidesIndex = selectedSlidesIndex;
    },

    setDialogForExport(type: DialogForExportTypes) {
      this.dialogForExport = type;
    },

    setTextFormatPainter(textFormatPainter: TextFormatPainter | null) {
      this.textFormatPainter = textFormatPainter;
    },

    setShapeFormatPainter(shapeFormatPainter: ShapeFormatPainter | null) {
      this.shapeFormatPainter = shapeFormatPainter;
    },

    setSelectPanelState(show: boolean) {
      this.showSelectPanel = show;
    },

    setSearchPanelState(show: boolean) {
      this.showSearchPanel = show;
    },

    setNotesPanelState(show: boolean) {
      this.showNotesPanel = show;
    },

    setSymbolPanelState(show: boolean) {
      this.showSymbolPanel = show;
    },

    setMarkupPanelState(show: boolean) {
      this.showMarkupPanel = show;
    },

    setImageLibPanelState(show: boolean) {
      this.showImageLibPanel = show;
    },

    setSidebarExpanded(expanded: boolean) {
      this.sidebarExpanded = expanded;
      // Save to localStorage for persistence
      try {
        localStorage.setItem('pptist-sidebar-expanded', JSON.stringify(expanded));
      } catch (e) {
        console.warn('Failed to save sidebar state:', e);
      }
    },
  },
});
