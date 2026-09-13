type HapticStyle = 'light' | 'medium' | 'success';

export function haptic(style: HapticStyle = 'light') {
  try {
    const pattern = style === 'success' ? [10, 28, 16] : style === 'medium' ? 16 : 8;
    navigator.vibrate?.(pattern);
  } catch {
    /* iOS often ignores vibrate; the tap still feels intentional */
  }
}
