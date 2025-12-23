export const SHAPE_PATH_FORMULAS_KEYS = {
  ROUND_RECT: 'roundRect',
  ROUND_RECT_CUSTOM: 'roundRectCustom',
  ROUND_RECT_DIAGONAL: 'roundRectDiagonal',
  ROUND_RECT_SINGLE: 'roundRectSingle',
  ROUND_RECT_SAMESIDE: 'roundRectSameSide',
  CUT_RECT_DIAGONAL: 'cutRectDiagonal',
  CUT_RECT_SINGLE: 'cutRectSingle',
  CUT_RECT_SAMESIDE: 'cutRectSameSide',
  CUT_ROUND_RECT: 'cutRoundRect',
  MESSAGE: 'message',
  ROUND_MESSAGE: 'roundMessage',
  L: 'L',
  RING_RECT: 'ringRect',
  PLUS: 'plus',
  TRIANGLE: 'triangle',
  PARALLELOGRAM_LEFT: 'parallelogramLeft',
  PARALLELOGRAM_RIGHT: 'parallelogramRight',
  TRAPEZOID: 'trapezoid',
  BULLET: 'bullet',
  INDICATOR: 'indicator',
} as const;

export type ShapePathFormulasKeys = (typeof SHAPE_PATH_FORMULAS_KEYS)[keyof typeof SHAPE_PATH_FORMULAS_KEYS];

export const ELEMENT_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  SHAPE: 'shape',
  LINE: 'line',
  CHART: 'chart',
  TABLE: 'table',
  LATEX: 'latex',
  VIDEO: 'video',
  AUDIO: 'audio',
} as const;

export type ElementTypes = (typeof ELEMENT_TYPES)[keyof typeof ELEMENT_TYPES];

/**
 * Gradient
 *
 * type: Gradient type (radial, linear)
 *
 * colors: Gradient color list (pos: percentage position; color: color)
 *
 * rotate: Gradient angle (linear gradient)
 */
export type GradientType = 'linear' | 'radial';
export type GradientColor = {
  pos: number;
  color: string;
};
export interface Gradient {
  type: GradientType;
  colors: GradientColor[];
  rotate: number;
}

export type LineStyleType = 'solid' | 'dashed' | 'dotted';

/**
 * Element shadow
 *
 * h: horizontal offset
 *
 * v: vertical offset
 *
 * blur: blur amount
 *
 * color: shadow color
 */
export interface PPTElementShadow {
  h: number;
  v: number;
  blur: number;
  color: string;
}

/**
 * Element border
 *
 * style?: border style (solid or dashed)
 *
 * width?: border width (shorthand for all borders)
 *
 * color?: border color (shorthand for all borders)
 *
 * Per-side borders (optional, overrides shorthand):
 * - top/right/bottom/left: individual border configuration
 */
export interface PPTElementOutline {
  style?: LineStyleType;
  width?: number;
  color?: string;

  // Per-side configuration
  top?: { width?: number; color?: string };
  right?: { width?: number; color?: string };
  bottom?: { width?: number; color?: string };
  left?: { width?: number; color?: string };

  borderRadius?: string;
}

export type ElementLinkType = 'web' | 'slide';

/**
 * Element hyperlink
 *
 * type: link type (web page, slide page)
 *
 * target: target address (web link, slide page ID)
 */
export interface PPTElementLink {
  type: ElementLinkType;
  target: string;
}

/**
 * Common element properties
 *
 * id: element ID
 *
 * left: element horizontal position (distance from left of canvas)
 *
 * top: element vertical position (distance from top of canvas)
 *
 * lock?: lock element
 *
 * groupId?: group ID (elements with the same group ID are members of the same group)
 *
 * width: element width
 *
 * height: element height
 *
 * rotate: rotation angle
 *
 * link?: hyperlink
 *
 * name?: element name
 */
interface PPTBaseElement {
  id: string;
  left: number;
  top: number;
  lock?: boolean;
  groupId?: string;
  width: number;
  height: number;
  rotate: number;
  link?: PPTElementLink;
  name?: string;
}

export type TextType =
  | 'title'
  | 'subtitle'
  | 'content'
  | 'item'
  | 'itemTitle'
  | 'notes'
  | 'header'
  | 'footer'
  | 'partNumber'
  | 'itemNumber'
  | 'pageNumber';

/**
 * Text element
 *
 * type: element type (text)
 *
 * content: text content (HTML string)
 *
 * defaultFontName: default font (overridden by inline style in HTML content)
 *
 * defaultColor: default color (overridden by inline style in HTML content)
 *
 * outline?: border
 *
 * fill?: fill color
 *
 * lineHeight?: line height (multiplier), default 1.5
 *
 * wordSpace?: word spacing, default 0
 *
 * opacity?: opacity, default 1
 *
 * shadow?: shadow
 *
 * paragraphSpace?: paragraph spacing, default 5px
 *
 * vertical?: vertical text
 *
 * textType?: text type
 */
export interface PPTTextElement extends PPTBaseElement {
  type: 'text';
  content: string;
  defaultFontName: string;
  defaultColor: string;
  outline?: PPTElementOutline;
  fill?: string;
  lineHeight?: number;
  wordSpace?: number;
  opacity?: number;
  shadow?: PPTElementShadow;
  paragraphSpace?: number;
  vertical?: boolean;
  textType?: TextType;
}

/**
 * Image/shape flip
 *
 * flipH?: horizontal flip
 *
 * flipV?: vertical flip
 */
export interface ImageOrShapeFlip {
  flipH?: boolean;
  flipV?: boolean;
}

/**
 * Image filter
 *
 * https://developer.mozilla.org/zh-CN/docs/Web/CSS/filter
 *
 * 'blur'?: blur, default 0 (px)
 *
 * 'brightness'?: brightness, default 100 (%)
 *
 * 'contrast'?: contrast, default 100 (%)
 *
 * 'grayscale'?: grayscale, default 0 (%)
 *
 * 'saturate'?: saturate, default 100 (%)
 *
 * 'hue-rotate'?: hue-rotate, default 0 (deg)
 *
 * 'opacity'?: opacity, default 100 (%)
 */
export type ImageElementFilterKeys =
  | 'blur'
  | 'brightness'
  | 'contrast'
  | 'grayscale'
  | 'saturate'
  | 'hue-rotate'
  | 'opacity'
  | 'sepia'
  | 'invert';
export interface ImageElementFilters {
  blur?: string;
  brightness?: string;
  contrast?: string;
  grayscale?: string;
  saturate?: string;
  'hue-rotate'?: string;
  sepia?: string;
  invert?: string;
  opacity?: string;
}

export type ImageClipDataRange = [[number, number], [number, number]];

/**
 * Image clip
 *
 * range: clip range, for example: [[10, 10], [90, 90]] represents clip the original image from the top left 10%, 10% to 90%, 90%
 *
 * shape: clip shape, see configs/imageClip.ts CLIPPATHS
 */
export interface ImageElementClip {
  range: ImageClipDataRange;
  shape: string;
}

export type ImageType = 'pageFigure' | 'itemFigure' | 'background';

/**
 * Image element
 *
 * type: element type (image)
 *
 * fixedRatio: fixed image aspect ratio
 *
 * src: image address
 *
 * outline?: border
 *
 * filters?: image filter
 *
 * clip?: clip information
 *
 * flipH?: horizontal flip
 *
 * flipV?: vertical flip
 *
 * shadow?: shadow
 *
 * radius?: radius
 *
 * colorMask?: color mask
 *
 * imageType?: image type
 */
export interface PPTImageElement extends PPTBaseElement {
  type: 'image';
  fixedRatio: boolean;
  src: string;
  outline?: PPTElementOutline;
  filters?: ImageElementFilters;
  clip?: ImageElementClip;
  flipH?: boolean;
  flipV?: boolean;
  shadow?: PPTElementShadow;
  radius?: number;
  colorMask?: string;
  imageType?: ImageType;
}

export type ShapeTextAlign = 'top' | 'middle' | 'bottom';

/**
 * Shape text
 *
 * content: text content (HTML string)
 *
 * defaultFontName: default font (overridden by inline style in HTML content)
 *
 * defaultColor: default color (overridden by inline style in HTML content)
 *
 * align: text alignment direction (vertical direction)
 *
 * type: text type
 */
export interface ShapeText {
  content: string;
  defaultFontName: string;
  defaultColor: string;
  align: ShapeTextAlign;
  type?: TextType;
}

/**
 * Shape element
 *
 * type: element type (shape)
 *
 * viewBox: SVG's viewBox attribute, for example [1000, 1000] represents '0 0 1000 1000'
 *
 * path: shape path, SVG path's d attribute
 *
 * fixedRatio: fixed shape aspect ratio
 *
 * fill: fill, effective when no gradient
 *
 * gradient?: gradient, this attribute will take precedence when filling
 *
 * pattern?: pattern, this attribute will take precedence when filling
 *
 * outline?: border
 *
 * opacity?: opacity
 *
 * flipH?: horizontal flip
 *
 * flipV?: vertical flip
 *
 * shadow?: shadow
 *
 * special?: special shape (mark some shapes that are difficult to parse, for example, the path uses types other than L Q C A, this type of shape will become a picture form after export)
 *
 * text?: shape text
 *
 * pathFormula?: shape path calculation formula
 * In most cases, the size of the shape changes only based on the scaling ratio of width and height based on viewBox, and viewBox itself and path will not change,
 * But some shapes hope to more accurately control the position of some key points when scaling, in which case you need to provide path calculation formulas,
 * By updating viewBox and recalculating path when scaling to redraw shape
 *
 * keypoints?: key point position percentage
 */
export interface PPTShapeElement extends PPTBaseElement {
  type: 'shape';
  viewBox: [number, number];
  path: string;
  fixedRatio: boolean;
  fill: string;
  gradient?: Gradient;
  pattern?: string;
  outline?: PPTElementOutline;
  opacity?: number;
  flipH?: boolean;
  flipV?: boolean;
  shadow?: PPTElementShadow;
  special?: boolean;
  text?: ShapeText;
  pathFormula?: ShapePathFormulasKeys;
  keypoints?: number[];
}

export type LinePoint = '' | 'arrow' | 'dot';

/**
 * Line element
 *
 * type: element type (line)
 *
 * start: start position ([x, y])
 *
 * end: end position ([x, y])
 *
 * style: line style (solid, dashed, dotted)
 *
 * color: line color
 *
 * points: end point style ([start style, end style], optional: none, arrow, dot)
 *
 * shadow?: shadow
 *
 * broken?: broken control point position ([x, y])
 *
 * broken2?: double broken control point position ([x, y])
 *
 * curve?: quadratic curve control point position ([x, y])
 *
 * cubic?: cubic curve control point position ([[x1, y1], [x2, y2]])
 */
export interface PPTLineElement extends Omit<PPTBaseElement, 'height' | 'rotate'> {
  type: 'line';
  start: [number, number];
  end: [number, number];
  style: LineStyleType;
  color: string;
  points: [LinePoint, LinePoint];
  shadow?: PPTElementShadow;
  broken?: [number, number];
  broken2?: [number, number];
  curve?: [number, number];
  cubic?: [[number, number], [number, number]];
}

export type ChartType = 'bar' | 'column' | 'line' | 'pie' | 'ring' | 'area' | 'radar' | 'scatter';

export interface ChartOptions {
  lineSmooth?: boolean;
  stack?: boolean;
}

export interface ChartData {
  labels: string[];
  legends: string[];
  series: number[][];
}

/**
 * Chart element
 *
 * type: element type (chart)
 *
 * fill?: fill color
 *
 * chartType: chart basic type (bar/line/pie), all chart types are derived from these three basic types
 *
 * data: chart data
 *
 * options: extended options
 *
 * outline?: border
 *
 * themeColors: theme color
 *
 * textColor?: text color
 *
 * lineColor?: line color
 */
export interface PPTChartElement extends PPTBaseElement {
  type: 'chart';
  fill?: string;
  chartType: ChartType;
  data: ChartData;
  options?: ChartOptions;
  outline?: PPTElementOutline;
  themeColors: string[];
  textColor?: string;
  lineColor?: string;
}

export type TextAlign = 'left' | 'center' | 'right' | 'justify';
/**
 * Table cell style
 *
 * bold?: bold
 *
 * em?: italic
 *
 * underline?: underline
 *
 * strikethrough?: strikethrough
 *
 * color?: font color
 *
 * backcolor?: fill color
 *
 * fontsize?: font size
 *
 * fontname?: font
 *
 * align?: alignment method
 */
export interface TableCellStyle {
  bold?: boolean;
  em?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  backcolor?: string;
  fontsize?: string;
  fontname?: string;
  align?: TextAlign;
}

/**
 * Table cell
 *
 * id: cell ID
 *
 * colspan: merge column number
 *
 * rowspan: merge row number
 *
 * text: text content
 *
 * style?: cell style
 */
export interface TableCell {
  id: string;
  colspan: number;
  rowspan: number;
  text: string;
  style?: TableCellStyle;
}

/**
 * Table theme
 *
 * color: theme color
 *
 * rowHeader: title row
 *
 * rowFooter: summary row
 *
 * colHeader: first column
 *
 * colFooter: last column
 */
export interface TableTheme {
  color: string;
  rowHeader: boolean;
  rowFooter: boolean;
  colHeader: boolean;
  colFooter: boolean;
}

/**
 * Table element
 *
 * type: element type (table)
 *
 * outline: border
 *
 * theme?: theme
 *
 * colWidths: column width array, for example [30, 50, 20] represents three column widths respectively 30%, 50%, 20%
 *
 * cellMinHeight: minimum cell height
 *
 * data: table data
 */
export interface PPTTableElement extends PPTBaseElement {
  type: 'table';
  outline: PPTElementOutline;
  theme?: TableTheme;
  colWidths: number[];
  cellMinHeight: number;
  data: TableCell[][];
}

/**
 * LaTeX element (formula)
 *
 * type: element type (latex)
 *
 * latex: latex code
 *
 * path: svg path
 *
 * color: color
 *
 * strokeWidth: path width
 *
 * viewBox: SVG's viewBox attribute
 *
 * fixedRatio: fixed shape aspect ratio
 */
export interface PPTLatexElement extends PPTBaseElement {
  type: 'latex';
  latex: string;
  path: string;
  color: string;
  strokeWidth: number;
  viewBox: [number, number];
  fixedRatio: boolean;
}

/**
 * Video element
 *
 * type: element type (video)
 *
 * src: video address
 *
 * autoplay: autoplay
 *
 * poster: preview cover
 *
 * ext: video suffix, use this field to confirm resource type when resource link is missing
 */
export interface PPTVideoElement extends PPTBaseElement {
  type: 'video';
  src: string;
  autoplay: boolean;
  poster?: string;
  ext?: string;
}

/**
 * Audio element
 *
 * type: element type (audio)
 *
 * fixedRatio: fixed icon aspect ratio
 *
 * color: icon color
 *
 * loop: loop play
 *
 * autoplay: autoplay
 *
 * src: audio address
 *
 * ext: audio suffix, use this field to confirm resource type when resource link is missing
 */
export interface PPTAudioElement extends PPTBaseElement {
  type: 'audio';
  fixedRatio: boolean;
  color: string;
  loop: boolean;
  autoplay: boolean;
  src: string;
  ext?: string;
}

export type PPTElement =
  | PPTTextElement
  | PPTImageElement
  | PPTShapeElement
  | PPTLineElement
  | PPTChartElement
  | PPTTableElement
  | PPTLatexElement
  | PPTVideoElement
  | PPTAudioElement;

export type AnimationType = 'in' | 'out' | 'attention';
export type AnimationTrigger = 'click' | 'meantime' | 'auto';

/**
 * Element animation
 *
 * id: animation id
 *
 * elId: element ID
 *
 * effect: animation effect
 *
 * type: animation type (entry, exit, emphasis)
 *
 * duration: animation duration
 *
 * trigger: animation trigger method (click - single click, meantime - at the same time as the previous animation, auto - after the previous animation)
 */
export interface PPTAnimation {
  id: string;
  elId: string;
  effect: string;
  type: AnimationType;
  duration: number;
  trigger: AnimationTrigger;
}

export type SlideBackgroundType = 'solid' | 'image' | 'gradient';
export type SlideBackgroundImageSize = 'cover' | 'contain' | 'repeat';
export interface SlideBackgroundImage {
  src: string;
  size: SlideBackgroundImageSize;
}

/**
 * Slide background
 *
 * type: background type (solid, image, gradient)
 *
 * color?: background color (solid)
 *
 * image?: image background
 *
 * gradientType?: gradient background
 */
export interface SlideBackground {
  type: SlideBackgroundType;
  color?: string;
  image?: SlideBackgroundImage;
  gradient?: Gradient;
}

export type TurningMode =
  | 'no'
  | 'fade'
  | 'slideX'
  | 'slideY'
  | 'random'
  | 'slideX3D'
  | 'slideY3D'
  | 'rotate'
  | 'scaleY'
  | 'scaleX'
  | 'scale'
  | 'scaleReverse';

export interface NoteReply {
  id: string;
  content: string;
  time: number;
  user: string;
}

export interface Note {
  id: string;
  content: string;
  time: number;
  user: string;
  elId?: string;
  replies?: NoteReply[];
}

export interface SectionTag {
  id: string;
  title?: string;
}

export type SlideType = 'cover' | 'contents' | 'transition' | 'content' | 'end';

/**
 * Layout metadata for template switching
 */
export interface SlideLayoutMetadata {
  /** Original layout data for re-rendering */
  schema: any;
  /** Current template ID (e.g., 'two-column-default') */
  templateId: string;
  /** Layout type (e.g., 'two_column') */
  layoutType: string;
  /** Template preview mode - true means slide is locked for editing until template is confirmed */
  isTemplatePreview?: boolean;
  /** User-customized template parameters (e.g., { IMAGE_RATIO: 0.5, SIDE_PADDING: 40 }) */
  parameterOverrides?: Record<string, number>;
}

/**
 * Slide page
 *
 * id: page ID
 *
 * elements: element collection
 *
 * notes?: comments
 *
 * remark?: remark
 *
 * background?: page background
 *
 * animations?: element animation collection
 *
 * turningMode?: turning mode
 *
 * slideType?: page type
 *
 * layout?: layout metadata for template switching (AI-generated slides only)
 */
export interface Slide {
  id: string;
  elements: PPTElement[];
  notes?: Note[];
  remark?: string;
  background?: SlideBackground;
  animations?: PPTAnimation[];
  turningMode?: TurningMode;
  sectionTag?: SectionTag;
  type?: SlideType;
  layout?: SlideLayoutMetadata;
}

/**
 * Slide theme
 *
 * backgroundColor: page background color
 *
 * themeColor: theme color, used for default shape color, etc.
 *
 * fontColor: font color
 *
 * fontName: font
 */
export interface SlideTheme {
  id?: string;
  name?: string;
  modifiers?: string | null;
  backgroundColor: string | Gradient;
  themeColors: string[];
  fontColor: string;
  fontName: string;
  titleFontName: string;
  titleFontColor: string;
  outline: PPTElementOutline;
  shadow: PPTElementShadow;
  labelFontColor?: string;
  labelFontName?: string;

  // For Layouts
  additionalElements?: PPTElement[];
  accentImageShape?: 'default' | 'big' | 'mixed';
  card?: {
    enabled: boolean;
    borderRadius: number;
    borderWidth: number;
    fill: 'none' | 'full' | 'semi';
    backgroundColor: string;
    textColor: string;
    shadow: PPTElementShadow;
  };

  createdAt?: string;     // ISO date string
  updatedAt?: string;     // ISO date string
}

export interface SlideTemplate {
  id: string;
  name: string;
  layout: string;         // Template layout type (e.g., 'list', 'title', 'twoColumn')
  config: {               // Layout configuration
    containers: Record<string, any>;
    [key: string]: any;
  };
  cover?: string;
  graphics?: any[];       // Graphics elements
  parameters?: Array<{    // Template parameters
    key: string;
    label: string;
    defaultValue: number;
    min?: number;
    max?: number;
    step?: number;
    description?: string;
  }>;
  createdAt?: string;     // ISO date string
  updatedAt?: string;     // ISO date string
}

export interface SlideViewport {
  width: number;
  height: number;
}
