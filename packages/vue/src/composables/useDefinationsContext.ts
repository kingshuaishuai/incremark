import { inject } from 'vue'
import { definationsInjectionKey } from './useProvideDefinations'

/**
 * support definations and footnoteDefinitions
 * @returns 
 */
export function useDefinationsContext() {
  const definationContext = inject(definationsInjectionKey);

  if (!definationContext) {
    throw new Error('definationContext not found');
  }

  return definationContext;
}