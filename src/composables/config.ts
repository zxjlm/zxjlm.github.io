import { computed, onBeforeUnmount, onMounted, reactive } from 'vue';
import { siteConfig } from '../site.config';
export const config = siteConfig.theme;
export const useThemeConfig = () => computed(() => config);
export function useAppStore() {
  const appearance = reactive({ isDark: false });
  let observer: MutationObserver;
  onMounted(() => {
    const sync = () => { appearance.isDark = document.documentElement.classList.contains('dark'); };
    sync();
    observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  });
  onBeforeUnmount(() => observer?.disconnect());
  return appearance;
}
