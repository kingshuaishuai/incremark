import type { Preview } from '@storybook/vue3';
import { setup } from '@storybook/vue3';
import { IncremarkContent } from '@incremark/vue';
import '@incremark/theme/chat.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
  decorators: [
    (story, context) => ({
      components: { story },
      template: `
        <div style="padding: 2rem; min-height: 400px;">
          <story />
        </div>
      `,
    }),
  ],
};

setup((app) => {
  app.component('IncremarkContent', IncremarkContent);
});

export default preview;
