type Listener = (code: string) => void;

let pending: Listener | null = null;
export const barcodePicker = {
  request(listener: Listener): void {
    pending = listener;
  },
  resolve(code: string): void {
    const listener = pending;
    pending = null;
    listener?.(code);
  },
  cancel(): void {
    pending = null;
  },
};
