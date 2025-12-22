import { ref, provide, type InjectionKey, type Ref } from 'vue';
import type { Definition, FootnoteDefinition } from 'mdast';

export const definationsInjectionKey: InjectionKey<{
  definations: Ref<Record<string, Definition>>
  footnoteDefinitions: Ref<Record<string, FootnoteDefinition>>
}> = Symbol('provideDefinations');

export function useProvideDefinations() {
  const definations = ref<Record<string, Definition>>({});
  const footnoteDefinitions = ref<Record<string, FootnoteDefinition>>({});

  provide(definationsInjectionKey, {
    definations,
    footnoteDefinitions
  });

  function setDefinations(definitions: Record<string, Definition>) {
    definations.value = definitions;
  }

  function setFootnoteDefinitions(definitions: Record<string, FootnoteDefinition>) {
    footnoteDefinitions.value = definitions;
  }

  function clearDefinations() {
    definations.value = {};
  }

  function clearFootnoteDefinitions() {
    footnoteDefinitions.value = {};
  }

  function clearAllDefinations() {
    clearDefinations();
    clearFootnoteDefinitions();
  }

  return {
    setDefinations,
    setFootnoteDefinitions,
    clearDefinations,
    clearFootnoteDefinitions,
    clearAllDefinations
  }

}