import { Platform } from 'react-native';

/**
 * Accessibility props for an <Svg> root. Native uses React Native's props;
 * on web react-native-svg renders a DOM <svg>, which needs ARIA attributes.
 */
export function svgA11y(label?: string): Record<string, unknown> {
  if (Platform.OS === 'web') {
    return label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };
  }
  return label
    ? { accessible: true, accessibilityLabel: label }
    : { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' };
}
