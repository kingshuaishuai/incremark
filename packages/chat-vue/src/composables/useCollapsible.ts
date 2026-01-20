import { ref } from 'vue';

export function useCollapsible(defaultExpanded = true) {
  const expanded = ref(defaultExpanded);
  const toggle = () => {
    expanded.value = !expanded.value;
  };
  return { expanded, toggle };
}
