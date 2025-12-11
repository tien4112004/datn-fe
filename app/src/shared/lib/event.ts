function subscribe(eventName: string, listener: (event: CustomEvent) => void) {
  document.addEventListener(eventName, listener as EventListener);
}

function unsubscribe(eventName: string, listener: (event: CustomEvent) => void) {
  document.removeEventListener(eventName, listener as EventListener);
}

function publish(eventName: string, data: any) {
  const event = new CustomEvent(eventName, { detail: data });
  document.dispatchEvent(event);
}

export { publish, subscribe, unsubscribe };
