import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TapButton from '../TapButton.vue';

describe('TapButton', () => {
  it('renders correctly', () => {
    const wrapper = mount(TapButton);
    expect(wrapper.find('.tap-button').exists()).toBe(true);
    expect(wrapper.find('.tap-button__image').exists()).toBe(true);
  });

  it('emits tap event on click', async () => {
    const wrapper = mount(TapButton);
    await wrapper.find('.tap-button').trigger('click');
    expect(wrapper.emitted()).toHaveProperty('tap');
  });

  it('does not emit tap when disabled', async () => {
    const wrapper = mount(TapButton, {
      props: { disabled: true },
    });
    await wrapper.find('.tap-button').trigger('click');
    expect(wrapper.emitted('tap')).toBeUndefined();
  });

  it('applies disabled class when disabled prop is true', () => {
    const wrapper = mount(TapButton, {
      props: { disabled: true },
    });
    expect(wrapper.find('.tap-button').classes()).toContain('tap-button--disabled');
  });
});
