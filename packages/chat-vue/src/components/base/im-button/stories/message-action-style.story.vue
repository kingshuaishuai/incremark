<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ImButton } from '..';
import { SvgIcon } from '../../../svg-icon';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px;">
    <div>
      <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Soft Square (适合 Message Actions)</div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <ImButton variant="soft" color="neutral" size="sm" square>
          <SvgIcon><Icon icon="ph:copy" /></SvgIcon>
        </ImButton>
        <ImButton variant="soft" color="neutral" size="sm" square>
          <SvgIcon><Icon icon="ph:thumbs-up" /></SvgIcon>
        </ImButton>
        <ImButton variant="soft" color="neutral" size="sm" square>
          <SvgIcon><Icon icon="ph:thumbs-down" /></SvgIcon>
        </ImButton>
        <ImButton variant="soft" color="neutral" size="sm" square>
          <SvgIcon><Icon icon="ph:arrows-clockwise" /></SvgIcon>
        </ImButton>
      </div>
    </div>

    <div>
      <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Subtle Square</div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <ImButton variant="subtle" color="neutral" size="sm" square>
          <SvgIcon><Icon icon="ph:copy" /></SvgIcon>
        </ImButton>
        <ImButton variant="subtle" color="neutral" size="sm" square>
          <SvgIcon><Icon icon="ph:thumbs-up" /></SvgIcon>
        </ImButton>
        <ImButton variant="subtle" color="neutral" size="sm" square>
          <SvgIcon><Icon icon="ph:thumbs-down" /></SvgIcon>
        </ImButton>
        <ImButton variant="subtle" color="neutral" size="sm" square>
          <SvgIcon><Icon icon="ph:arrows-clockwise" /></SvgIcon>
        </ImButton>
      </div>
    </div>

    <div>
      <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Ghost (最轻量)</div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <ImButton variant="ghost" color="neutral" size="sm" square>
          <SvgIcon><Icon icon="ph:copy" /></SvgIcon>
        </ImButton>
        <ImButton variant="ghost" color="neutral" size="sm" square>
          <SvgIcon><Icon icon="ph:thumbs-up" /></SvgIcon>
        </ImButton>
        <ImButton variant="ghost" color="neutral" size="sm" square>
          <SvgIcon><Icon icon="ph:thumbs-down" /></SvgIcon>
        </ImButton>
        <ImButton variant="ghost" color="neutral" size="sm" square>
          <SvgIcon><Icon icon="ph:arrows-clockwise" /></SvgIcon>
        </ImButton>
      </div>
    </div>

    <div>
      <div style="font-size: 12px; color: #666; margin-bottom: 8px;">带颜色反馈</div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <ImButton variant="soft" color="neutral" size="sm" square>
          <SvgIcon><Icon icon="ph:copy" /></SvgIcon>
        </ImButton>
        <ImButton variant="soft" color="success" size="sm" square>
          <SvgIcon><Icon icon="ph:thumbs-up-fill" /></SvgIcon>
        </ImButton>
        <ImButton variant="soft" color="error" size="sm" square>
          <SvgIcon><Icon icon="ph:thumbs-down-fill" /></SvgIcon>
        </ImButton>
        <ImButton variant="soft" color="primary" size="sm" square>
          <SvgIcon><Icon icon="ph:arrows-clockwise" /></SvgIcon>
        </ImButton>
      </div>
    </div>

    <div>
      <div style="font-size: 12px; color: #666; margin-bottom: 8px;">XS 尺寸 (更紧凑)</div>
      <div style="display: flex; gap: 6px; align-items: center;">
        <ImButton variant="soft" color="neutral" size="xs" square>
          <SvgIcon><Icon icon="ph:copy" /></SvgIcon>
        </ImButton>
        <ImButton variant="soft" color="neutral" size="xs" square>
          <SvgIcon><Icon icon="ph:thumbs-up" /></SvgIcon>
        </ImButton>
        <ImButton variant="soft" color="neutral" size="xs" square>
          <SvgIcon><Icon icon="ph:thumbs-down" /></SvgIcon>
        </ImButton>
        <ImButton variant="soft" color="neutral" size="xs" square>
          <SvgIcon><Icon icon="ph:arrows-clockwise" /></SvgIcon>
        </ImButton>
      </div>
    </div>
  </div>
</template>
