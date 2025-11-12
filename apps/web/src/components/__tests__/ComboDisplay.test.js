import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ComboDisplay from '../ComboDisplay.vue';

describe('ComboDisplay', () => {
  describe('Rendering', () => {
    it('should render when combo is greater than 0', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 5,
          multiplier: 1.2,
        },
      });

      expect(wrapper.find('.combo-display').exists()).toBe(true);
    });

    it('should not render when combo is 0', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 0,
          multiplier: 1.0,
        },
      });

      expect(wrapper.find('.combo-display').exists()).toBe(false);
    });

    it('should display combo count', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 7,
          multiplier: 1.2,
        },
      });

      expect(wrapper.text()).toContain('7');
    });

    it('should display multiplier', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 10,
          multiplier: 1.5,
        },
      });

      expect(wrapper.text()).toContain('1.5x');
    });

    it('should display "HITS" label', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 12,
          multiplier: 1.5,
        },
      });

      expect(wrapper.text()).toContain('HITS');
    });

    it('should format as "X HITS • Y.Zx"', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 8,
          multiplier: 1.2,
        },
      });

      const text = wrapper.text();
      expect(text).toMatch(/8.*HITS.*1\.2x/);
    });
  });

  describe('Props', () => {
    it('should accept combo prop', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 15,
          multiplier: 2.0,
        },
      });

      expect(wrapper.props('combo')).toBe(15);
    });

    it('should accept multiplier prop', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 20,
          multiplier: 3.0,
        },
      });

      expect(wrapper.props('multiplier')).toBe(3.0);
    });

    it('should handle different combo values', () => {
      const testCases = [1, 5, 10, 15, 20, 25, 100];

      testCases.forEach((comboValue) => {
        const wrapper = mount(ComboDisplay, {
          props: {
            combo: comboValue,
            multiplier: 1.0,
          },
        });

        expect(wrapper.text()).toContain(comboValue.toString());
      });
    });

    it('should handle different multiplier values', () => {
      const testCases = [
        { multiplier: 1.0, expected: '1.0x' },
        { multiplier: 1.2, expected: '1.2x' },
        { multiplier: 1.5, expected: '1.5x' },
        { multiplier: 2.0, expected: '2.0x' },
        { multiplier: 3.0, expected: '3.0x' },
      ];

      testCases.forEach(({ multiplier, expected }) => {
        const wrapper = mount(ComboDisplay, {
          props: {
            combo: 10,
            multiplier,
          },
        });

        expect(wrapper.text()).toContain(expected);
      });
    });
  });

  describe('Styling', () => {
    it('should have combo-display class', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 5,
          multiplier: 1.2,
        },
      });

      expect(wrapper.classes()).toContain('combo-display');
    });

    it('should apply milestone class when combo is 5', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 5,
          multiplier: 1.2,
        },
      });

      expect(wrapper.classes()).toContain('combo-display--milestone');
    });

    it('should apply milestone class when combo is 10', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 10,
          multiplier: 1.5,
        },
      });

      expect(wrapper.classes()).toContain('combo-display--milestone');
    });

    it('should apply milestone class when combo is 15', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 15,
          multiplier: 2.0,
        },
      });

      expect(wrapper.classes()).toContain('combo-display--milestone');
    });

    it('should apply milestone class when combo is 20', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 20,
          multiplier: 3.0,
        },
      });

      expect(wrapper.classes()).toContain('combo-display--milestone');
    });

    it('should not apply milestone class when combo is 6', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 6,
          multiplier: 1.2,
        },
      });

      expect(wrapper.classes()).not.toContain('combo-display--milestone');
    });
  });

  describe('Edge Cases', () => {
    it('should handle combo of 1', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 1,
          multiplier: 1.0,
        },
      });

      expect(wrapper.text()).toContain('1 HITS');
    });

    it('should handle very high combo values', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 999,
          multiplier: 3.0,
        },
      });

      expect(wrapper.text()).toContain('999');
    });

    it('should not render with negative combo', () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: -1,
          multiplier: 1.0,
        },
      });

      expect(wrapper.find('.combo-display').exists()).toBe(false);
    });
  });

  describe('Reactivity', () => {
    it('should update display when combo prop changes', async () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 5,
          multiplier: 1.2,
        },
      });

      expect(wrapper.text()).toContain('5');

      await wrapper.setProps({ combo: 10 });
      expect(wrapper.text()).toContain('10');
    });

    it('should update display when multiplier prop changes', async () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 10,
          multiplier: 1.2,
        },
      });

      expect(wrapper.text()).toContain('1.2x');

      await wrapper.setProps({ multiplier: 1.5 });
      expect(wrapper.text()).toContain('1.5x');
    });

    it('should hide when combo changes to 0', async () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 5,
          multiplier: 1.2,
        },
      });

      expect(wrapper.find('.combo-display').exists()).toBe(true);

      await wrapper.setProps({ combo: 0 });
      expect(wrapper.find('.combo-display').exists()).toBe(false);
    });

    it('should show when combo changes from 0 to positive', async () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 0,
          multiplier: 1.0,
        },
      });

      expect(wrapper.find('.combo-display').exists()).toBe(false);

      await wrapper.setProps({ combo: 1 });
      expect(wrapper.find('.combo-display').exists()).toBe(true);
    });

    it('should update milestone class when crossing milestone', async () => {
      const wrapper = mount(ComboDisplay, {
        props: {
          combo: 4,
          multiplier: 1.0,
        },
      });

      expect(wrapper.classes()).not.toContain('combo-display--milestone');

      await wrapper.setProps({ combo: 5, multiplier: 1.2 });
      expect(wrapper.classes()).toContain('combo-display--milestone');
    });
  });
});
