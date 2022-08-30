import { useForegroundColor } from '@/design-system';
import React from 'react';

type NavbarIconProps = {
  icon: React.ElementType;
};

export function NavbarSvgIcon({ icon: Icon }: NavbarIconProps) {
  const color = useForegroundColor('primary');
  return <Icon color={color} />;
}
