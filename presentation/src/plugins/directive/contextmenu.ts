import { type Directive, type DirectiveBinding, createVNode, render } from 'vue';
import ContextmenuComponent from '@/components/Contextmenu/index.vue';

const CTX_CONTEXTMENU_HANDLER = 'CTX_CONTEXTMENU_HANDLER';

interface CustomHTMLElement extends HTMLElement {
  [CTX_CONTEXTMENU_HANDLER]?: (event: MouseEvent) => void;
}

const contextmenuListener = (el: HTMLElement, event: MouseEvent, binding: DirectiveBinding) => {
  event.stopPropagation();
  event.preventDefault();

  const menus = binding.value(el);
  if (!menus) return;

  let container: HTMLDivElement | null = null;

  // Remove context menu and cancel related event listeners
  const removeContextmenu = () => {
    if (container) {
      document.body.removeChild(container);
      container = null;
    }
    el.classList.remove('contextmenu-active');
    document.body.removeEventListener('scroll', removeContextmenu);
    window.removeEventListener('resize', removeContextmenu);
  };

  // Create custom menu
  const options = {
    axis: { x: event.x, y: event.y },
    el,
    menus,
    removeContextmenu,
  };
  container = document.createElement('div');
  const vm = createVNode(ContextmenuComponent, options, null);
  render(vm, container);
  document.body.appendChild(container);

  // Add menu active state className to target node
  el.classList.add('contextmenu-active');

  // Remove menu when page changes
  document.body.addEventListener('scroll', removeContextmenu);
  window.addEventListener('resize', removeContextmenu);
};

const ContextmenuDirective: Directive = {
  mounted(el: CustomHTMLElement, binding) {
    el[CTX_CONTEXTMENU_HANDLER] = (event: MouseEvent) => contextmenuListener(el, event, binding);
    el.addEventListener('contextmenu', el[CTX_CONTEXTMENU_HANDLER]);
  },

  unmounted(el: CustomHTMLElement) {
    if (el && el[CTX_CONTEXTMENU_HANDLER]) {
      el.removeEventListener('contextmenu', el[CTX_CONTEXTMENU_HANDLER]);
      delete el[CTX_CONTEXTMENU_HANDLER];
    }
  },
};

export default ContextmenuDirective;
