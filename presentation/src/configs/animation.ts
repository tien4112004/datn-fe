import type { TurningMode } from '@/types/slides';
import { useI18n } from 'vue-i18n';

export const ANIMATION_DEFAULT_DURATION = 1000;
export const ANIMATION_DEFAULT_TRIGGER = 'click';
export const ANIMATION_CLASS_PREFIX = 'animate__';

type PresetAnimation = {
  type: string;
  name: string;
  children: { name: string; value: string }[];
};

export function getEnterAnimations(): PresetAnimation[] {
  const { t } = useI18n();
  return [
    {
      type: 'bounce',
      name: t('content.animations.entrance.bounce'),
      children: [
        { name: t('content.animations.entrance.bounceIn'), value: 'bounceIn' },
        { name: t('content.animations.entrance.bounceInRight'), value: 'bounceInLeft' },
        { name: t('content.animations.entrance.bounceInLeft'), value: 'bounceInRight' },
        { name: t('content.animations.entrance.bounceInUp'), value: 'bounceInUp' },
        { name: t('content.animations.entrance.bounceInDown'), value: 'bounceInDown' },
      ],
    },
    {
      type: 'fade',
      name: t('content.animations.entrance.fadeIn'),
      children: [
        { name: t('content.animations.entrance.fadeIn'), value: 'fadeIn' },
        { name: t('content.animations.entrance.fadeInDown'), value: 'fadeInDown' },
        { name: t('content.animations.entrance.fadeInDownBig'), value: 'fadeInDownBig' },
        { name: t('content.animations.entrance.fadeInRight'), value: 'fadeInLeft' },
        { name: t('content.animations.entrance.fadeInRightBig'), value: 'fadeInLeftBig' },
        { name: t('content.animations.entrance.fadeInLeft'), value: 'fadeInRight' },
        { name: t('content.animations.entrance.fadeInLeftBig'), value: 'fadeInRightBig' },
        { name: t('content.animations.entrance.fadeInUp'), value: 'fadeInUp' },
        { name: t('content.animations.entrance.fadeInUpBig'), value: 'fadeInUpBig' },
        { name: t('content.animations.entrance.fadeInTopLeft'), value: 'fadeInTopLeft' },
        { name: t('content.animations.entrance.fadeInTopRight'), value: 'fadeInTopRight' },
        { name: t('content.animations.entrance.fadeInBottomLeft'), value: 'fadeInBottomLeft' },
        { name: t('content.animations.entrance.fadeInBottomRight'), value: 'fadeInBottomRight' },
      ],
    },
    {
      type: 'rotate',
      name: t('content.animations.entrance.rotateIn'),
      children: [
        { name: t('content.animations.entrance.rotateIn'), value: 'rotateIn' },
        { name: t('content.animations.entrance.rotateInDownLeft'), value: 'rotateInDownLeft' },
        { name: t('content.animations.entrance.rotateInDownRight'), value: 'rotateInDownRight' },
        { name: t('content.animations.entrance.rotateInUpLeft'), value: 'rotateInUpLeft' },
        { name: t('content.animations.entrance.rotateInUpRight'), value: 'rotateInUpRight' },
      ],
    },
    {
      type: 'zoom',
      name: t('content.animations.entrance.zoomIn'),
      children: [
        { name: t('content.animations.entrance.zoomIn'), value: 'zoomIn' },
        { name: t('content.animations.entrance.zoomInDown'), value: 'zoomInDown' },
        { name: t('content.animations.entrance.zoomInLeft'), value: 'zoomInLeft' },
        { name: t('content.animations.entrance.zoomInRight'), value: 'zoomInRight' },
        { name: t('content.animations.entrance.zoomInUp'), value: 'zoomInUp' },
      ],
    },
    {
      type: 'slide',
      name: t('content.animations.entrance.slideIn'),
      children: [
        { name: t('content.animations.entrance.slideInDown'), value: 'slideInDown' },
        { name: t('content.animations.entrance.slideInLeft'), value: 'slideInLeft' },
        { name: t('content.animations.entrance.slideInRight'), value: 'slideInRight' },
        { name: t('content.animations.entrance.slideInUp'), value: 'slideInUp' },
      ],
    },
    {
      type: 'flip',
      name: t('content.animations.entrance.flipIn'),
      children: [
        { name: t('content.animations.entrance.flipInXAxis'), value: 'flipInX' },
        { name: t('content.animations.entrance.flipInYAxis'), value: 'flipInY' },
      ],
    },
    {
      type: 'back',
      name: t('content.animations.entrance.backZoomIn'),
      children: [
        { name: t('content.animations.entrance.backZoomInDown'), value: 'backInDown' },
        { name: t('content.animations.entrance.backZoomInLeft'), value: 'backInLeft' },
        { name: t('content.animations.entrance.backZoomInRight'), value: 'backInRight' },
        { name: t('content.animations.entrance.backZoomInUp'), value: 'backInUp' },
      ],
    },
    {
      type: 'lightSpeed',
      name: t('content.animations.entrance.lightSpeedIn'),
      children: [
        { name: t('content.animations.entrance.lightSpeedInRight'), value: 'lightSpeedInRight' },
        { name: t('content.animations.entrance.lightSpeedInLeft'), value: 'lightSpeedInLeft' },
      ],
    },
  ];
}

export function getExitAnimations(): PresetAnimation[] {
  const { t } = useI18n();
  return [
    {
      type: 'bounce',
      name: t('content.animations.entrance.bounce'),
      children: [
        { name: t('content.animations.exit.bounceOut'), value: 'bounceOut' },
        { name: t('content.animations.exit.bounceOutLeft'), value: 'bounceOutLeft' },
        { name: t('content.animations.exit.bounceOutRight'), value: 'bounceOutRight' },
        { name: t('content.animations.exit.bounceOutUp'), value: 'bounceOutUp' },
        { name: t('content.animations.exit.bounceOutDown'), value: 'bounceOutDown' },
      ],
    },
    {
      type: 'fade',
      name: t('content.animations.exit.fadeOut'),
      children: [
        { name: t('content.animations.exit.fadeOut'), value: 'fadeOut' },
        { name: t('content.animations.exit.fadeOutDown'), value: 'fadeOutDown' },
        { name: t('content.animations.exit.fadeOutDownBig'), value: 'fadeOutDownBig' },
        { name: t('content.animations.exit.fadeOutLeft'), value: 'fadeOutLeft' },
        { name: t('content.animations.exit.fadeOutLeftBig'), value: 'fadeOutLeftBig' },
        { name: t('content.animations.exit.fadeOutRight'), value: 'fadeOutRight' },
        { name: t('content.animations.exit.fadeOutRightBig'), value: 'fadeOutRightBig' },
        { name: t('content.animations.exit.fadeOutUp'), value: 'fadeOutUp' },
        { name: t('content.animations.exit.fadeOutUpBig'), value: 'fadeOutUpBig' },
        { name: t('content.animations.exit.fadeOutTopLeft'), value: 'fadeOutTopLeft' },
        { name: t('content.animations.exit.fadeOutTopRight'), value: 'fadeOutTopRight' },
        { name: t('content.animations.exit.fadeOutBottomLeft'), value: 'fadeOutBottomLeft' },
        { name: t('content.animations.exit.fadeOutBottomRight'), value: 'fadeOutBottomRight' },
      ],
    },
    {
      type: 'rotate',
      name: t('content.animations.exit.rotateOut'),
      children: [
        { name: t('content.animations.exit.rotateOut'), value: 'rotateOut' },
        { name: t('content.animations.exit.rotateOutDownLeft'), value: 'rotateOutDownLeft' },
        { name: t('content.animations.exit.rotateOutDownRight'), value: 'rotateOutDownRight' },
        { name: t('content.animations.exit.rotateOutUpLeft'), value: 'rotateOutUpLeft' },
        { name: t('content.animations.exit.rotateOutUpRight'), value: 'rotateOutUpRight' },
      ],
    },
    {
      type: 'zoom',
      name: t('content.animations.exit.zoomOut'),
      children: [
        { name: t('content.animations.exit.zoomOut'), value: 'zoomOut' },
        { name: t('content.animations.exit.zoomOutDown'), value: 'zoomOutDown' },
        { name: t('content.animations.exit.zoomOutLeft'), value: 'zoomOutLeft' },
        { name: t('content.animations.exit.zoomOutRight'), value: 'zoomOutRight' },
        { name: t('content.animations.exit.zoomOutUp'), value: 'zoomOutUp' },
      ],
    },
    {
      type: 'slide',
      name: t('content.animations.exit.slideOut'),
      children: [
        { name: t('content.animations.exit.slideOutDown'), value: 'slideOutDown' },
        { name: t('content.animations.exit.slideOutLeft'), value: 'slideOutLeft' },
        { name: t('content.animations.exit.slideOutRight'), value: 'slideOutRight' },
        { name: t('content.animations.exit.slideOutUp'), value: 'slideOutUp' },
      ],
    },
    {
      type: 'flip',
      name: t('content.animations.exit.flipOut'),
      children: [
        { name: t('content.animations.exit.flipOutX'), value: 'flipOutX' },
        { name: t('content.animations.exit.flipOutY'), value: 'flipOutY' },
        { name: t('content.animations.exit.backZoomOut'), value: 'backZoomOut' },
        { name: t('content.animations.exit.backZoomOutDown'), value: 'backZoomOutDown' },
        { name: t('content.animations.exit.backZoomOutLeft'), value: 'backZoomOutLeft' },
        { name: t('content.animations.exit.backZoomOutRight'), value: 'backZoomOutRight' },
        { name: t('content.animations.exit.backZoomOutUp'), value: 'backZoomOutUp' },
      ],
    },
    {
      type: 'lightSpeed',
      name: t('content.animations.exit.lightSpeedOut'),
      children: [
        { name: t('content.animations.exit.lightSpeedOutRight'), value: 'lightSpeedOutRight' },
        { name: t('content.animations.exit.lightSpeedOutLeft'), value: 'lightSpeedOutLeft' },
      ],
    },
  ];
}

export function getAttentionAnimations(): PresetAnimation[] {
  const { t } = useI18n();
  return [
    {
      type: 'shake',
      name: t('content.animations.emphasis.shake'),
      children: [
        { name: t('content.animations.emphasis.shakeLeftAndRight'), value: 'shakeX' },
        { name: t('content.animations.emphasis.shakeUpAndDown'), value: 'shakeY' },
        { name: t('content.animations.emphasis.headShake'), value: 'headShake' },
        { name: t('content.animations.emphasis.swing'), value: 'swing' },
        { name: t('content.animations.emphasis.wobble'), value: 'wobble' },
        { name: t('content.animations.emphasis.tada'), value: 'tada' },
        { name: t('content.animations.emphasis.jello'), value: 'jello' },
      ],
    },
    {
      type: 'other',
      name: t('content.animations.special.other'),
      children: [
        { name: t('content.animations.entrance.bounce'), value: 'bounce' },
        { name: t('content.animations.emphasis.flash'), value: 'flash' },
        { name: t('content.animations.emphasis.pulse'), value: 'pulse' },
        { name: t('content.animations.emphasis.rubberBand'), value: 'rubberBand' },
        { name: t('content.animations.emphasis.heartBeatFast'), value: 'heartBeat' },
      ],
    },
  ];
}

interface SlideAnimation {
  label: string;
  value: TurningMode;
}

export function getSlideAnimations(): SlideAnimation[] {
  const { t } = useI18n();
  return [
    { label: t('content.animations.special.none'), value: 'no' },
    { label: t('content.animations.special.random'), value: 'random' },
    { label: t('content.animations.transitions.slideLeftAndRight'), value: 'slideX' },
    { label: t('content.animations.transitions.slideUpAndDown'), value: 'slideY' },
    { label: t('content.animations.transitions.slideLeftAndRight3D'), value: 'slideX3D' },
    { label: t('content.animations.transitions.slideUpAndDown3D'), value: 'slideY3D' },
    { label: t('content.animations.transitions.fadeInAndOut'), value: 'fade' },
    { label: t('content.animations.transitions.rotate'), value: 'rotate' },
    { label: t('content.animations.transitions.expandUpAndDown'), value: 'scaleY' },
    { label: t('content.animations.transitions.expandLeftAndRight'), value: 'scaleX' },
    { label: t('content.animations.entrance.zoomIn'), value: 'scale' },
    { label: t('content.animations.exit.zoomOut'), value: 'scaleReverse' },
  ];
}
