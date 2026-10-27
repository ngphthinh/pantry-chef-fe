type Listener = () => void;

/** Pub/sub tối giản để tầng HTTP báo sự kiện lên UI mà không phụ thuộc router/React. */
export class Emitter {
  private listeners = new Set<Listener>();

  on(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(): void {
    this.listeners.forEach((l) => l());
  }
}

export const unauthorizedEvent = new Emitter(); // 401
export const forbiddenEvent = new Emitter(); // 403
