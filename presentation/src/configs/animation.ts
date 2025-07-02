import type { TurningMode } from '@/types/slides';

export const ANIMATION_DEFAULT_DURATION = 1000;
export const ANIMATION_DEFAULT_TRIGGER = 'click';
export const ANIMATION_CLASS_PREFIX = 'animate__';

export const ENTER_ANIMATIONS = [
  {
    type: 'bounce',
    name: 'Bounce',
    children: [
      { name: 'Bounce In', value: 'bounceIn' },
      { name: 'Bounce In Right', value: 'bounceInLeft' },
      { name: 'Bounce In Left', value: 'bounceInRight' },
      { name: 'Bounce In Up', value: 'bounceInUp' },
      { name: 'Bounce In Down', value: 'bounceInDown' },
    ],
  },
  {
    type: 'fade',
    name: 'Fade In',
    children: [
      { name: 'Fade In', value: 'fadeIn' },
      { name: 'Fade In Down', value: 'fadeInDown' },
      { name: 'Fade In Down Big', value: 'fadeInDownBig' },
      { name: 'Fade In Right', value: 'fadeInLeft' },
      { name: 'Fade In Right Big', value: 'fadeInLeftBig' },
      { name: 'Fade In Left', value: 'fadeInRight' },
      { name: 'Fade In Left Big', value: 'fadeInRightBig' },
      { name: 'Fade In Up', value: 'fadeInUp' },
      { name: 'Fade In Up Big', value: 'fadeInUpBig' },
      { name: 'Fade In Top Left', value: 'fadeInTopLeft' },
      { name: 'Fade In Top Right', value: 'fadeInTopRight' },
      { name: 'Fade In Bottom Left', value: 'fadeInBottomLeft' },
      { name: 'Fade In Bottom Right', value: 'fadeInBottomRight' },
    ],
  },
  {
    type: 'rotate',
    name: 'Rotate In',
    children: [
      { name: 'Rotate In', value: 'rotateIn' },
      { name: 'Rotate In Down Left', value: 'rotateInDownLeft' },
      { name: 'Rotate In Down Right', value: 'rotateInDownRight' },
      { name: 'Rotate In Up Left', value: 'rotateInUpLeft' },
      { name: 'Rotate In Up Right', value: 'rotateInUpRight' },
    ],
  },
  {
    type: 'zoom',
    name: 'Zoom In',
    children: [
      { name: 'Zoom In', value: 'zoomIn' },
      { name: 'Zoom In Down', value: 'zoomInDown' },
      { name: 'Zoom In Left', value: 'zoomInLeft' },
      { name: 'Zoom In Right', value: 'zoomInRight' },
      { name: 'Zoom In Up', value: 'zoomInUp' },
    ],
  },
  {
    type: 'slide',
    name: 'Slide In',
    children: [
      { name: 'Slide In Down', value: 'slideInDown' },
      { name: 'Slide In Left', value: 'slideInLeft' },
      { name: 'Slide In Right', value: 'slideInRight' },
      { name: 'Slide In Up', value: 'slideInUp' },
    ],
  },
  {
    type: 'flip',
    name: 'Flip In',
    children: [
      { name: 'Flip In X Axis', value: 'flipInX' },
      { name: 'Flip In Y Axis', value: 'flipInY' },
    ],
  },
  {
    type: 'back',
    name: 'Back Zoom In',
    children: [
      { name: 'Back Zoom In Down', value: 'backInDown' },
      { name: 'Back Zoom In Left', value: 'backInLeft' },
      { name: 'Back Zoom In Right', value: 'backInRight' },
      { name: 'Back Zoom In Up', value: 'backInUp' },
    ],
  },
  {
    type: 'lightSpeed',
    name: 'Light Speed In',
    children: [
      { name: 'Light Speed In Right', value: 'lightSpeedInRight' },
      { name: 'Light Speed In Left', value: 'lightSpeedInLeft' },
    ],
  },
];

export const EXIT_ANIMATIONS = [
  {
    type: 'bounce',
    name: 'Bounce',
    children: [
      { name: 'Bounce Out', value: 'bounceOut' },
      { name: 'Bounce Out Left', value: 'bounceOutLeft' },
      { name: 'Bounce Out Right', value: 'bounceOutRight' },
      { name: 'Bounce Out Up', value: 'bounceOutUp' },
      { name: 'Bounce Out Down', value: 'bounceOutDown' },
    ],
  },
  {
    type: 'fade',
    name: 'Fade Out',
    children: [
      { name: 'Fade Out', value: 'fadeOut' },
      { name: 'Fade Out Down', value: 'fadeOutDown' },
      { name: 'Fade Out Down Big', value: 'fadeOutDownBig' },
      { name: 'Fade Out Left', value: 'fadeOutLeft' },
      { name: 'Fade Out Left Big', value: 'fadeOutLeftBig' },
      { name: 'Fade Out Right', value: 'fadeOutRight' },
      { name: 'Fade Out Right Big', value: 'fadeOutRightBig' },
      { name: 'Fade Out Up', value: 'fadeOutUp' },
      { name: 'Fade Out Up Big', value: 'fadeOutUpBig' },
      { name: 'Fade Out Top Left', value: 'fadeOutTopLeft' },
      { name: 'Fade Out Top Right', value: 'fadeOutTopRight' },
      { name: 'Fade Out Bottom Left', value: 'fadeOutBottomLeft' },
      { name: 'Fade Out Bottom Right', value: 'fadeOutBottomRight' },
    ],
  },
  {
    type: 'rotate',
    name: 'Rotate Out',
    children: [
      { name: 'Rotate Out', value: 'rotateOut' },
      { name: 'Rotate Out Down Left', value: 'rotateOutDownLeft' },
      { name: 'Rotate Out Down Right', value: 'rotateOutDownRight' },
      { name: 'Rotate Out Up Left', value: 'rotateOutUpLeft' },
      { name: 'Rotate Out Up Right', value: 'rotateOutUpRight' },
    ],
  },
  {
    type: 'zoom',
    name: 'Zoom Out',
    children: [
      { name: 'Zoom Out', value: 'zoomOut' },
      { name: 'Zoom Out Down', value: 'zoomOutDown' },
      { name: 'Zoom Out Left', value: 'zoomOutLeft' },
      { name: 'Zoom Out Right', value: 'zoomOutRight' },
      { name: 'Zoom Out Up', value: 'zoomOutUp' },
    ],
  },
  {
    type: 'slide',
    name: 'Slide Out',
    children: [
      { name: 'Slide Out Down', value: 'slideOutDown' },
      { name: 'Slide Out Left', value: 'slideOutLeft' },
      { name: 'Slide Out Right', value: 'slideOutRight' },
      { name: 'Slide Out Up', value: 'slideOutUp' },
    ],
  },
  {
    type: 'flip',
    name: 'Flip Out',
    children: [
      { name: 'Flip Out X Axis', value: 'flipOutX' },
      { name: 'Flip Out Y Axis', value: 'flipOutY' },
    ],
  },
  {
    type: 'back',
    name: 'Back Zoom Out',
    children: [
      { name: 'Back Zoom Out Down', value: 'backOutDown' },
      { name: 'Back Zoom Out Left', value: 'backOutLeft' },
      { name: 'Back Zoom Out Right', value: 'backOutRight' },
      { name: 'Back Zoom Out Up', value: 'backOutUp' },
    ],
  },
  {
    type: 'lightSpeed',
    name: 'Light Speed Out',
    children: [
      { name: 'Light Speed Out Right', value: 'lightSpeedOutRight' },
      { name: 'Light Speed Out Left', value: 'lightSpeedOutLeft' },
    ],
  },
];

export const ATTENTION_ANIMATIONS = [
  {
    type: 'shake',
    name: 'Shake',
    children: [
      { name: 'Shake Left and Right', value: 'shakeX' },
      { name: 'Shake Up and Down', value: 'shakeY' },
      { name: 'Head Shake', value: 'headShake' },
      { name: 'Swing', value: 'swing' },
      { name: 'Wobble', value: 'wobble' },
      { name: 'Tada', value: 'tada' },
      { name: 'Jello', value: 'jello' },
    ],
  },
  {
    type: 'other',
    name: 'Other',
    children: [
      { name: 'Bounce', value: 'bounce' },
      { name: 'Flash', value: 'flash' },
      { name: 'Pulse', value: 'pulse' },
      { name: 'Rubber Band', value: 'rubberBand' },
      { name: 'Heart Beat (Fast)', value: 'heartBeat' },
    ],
  },
];

interface SlideAnimation {
  label: string;
  value: TurningMode;
}

export const SLIDE_ANIMATIONS: SlideAnimation[] = [
  { label: 'None', value: 'no' },
  { label: 'Random', value: 'random' },
  { label: 'Slide Left and Right', value: 'slideX' },
  { label: 'Slide Up and Down', value: 'slideY' },
  { label: 'Slide Left and Right (3D)', value: 'slideX3D' },
  { label: 'Slide Up and Down (3D)', value: 'slideY3D' },
  { label: 'Fade In and Out', value: 'fade' },
  { label: 'Rotate', value: 'rotate' },
  { label: 'Expand Up and Down', value: 'scaleY' },
  { label: 'Expand Left and Right', value: 'scaleX' },
  { label: 'Zoom In', value: 'scale' },
  { label: 'Zoom Out', value: 'scaleReverse' },
];
