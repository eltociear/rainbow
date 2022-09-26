import * as React from 'react';
import { Box } from '@/design-system';
import { StickyHeader } from '../core/StickyHeaders';
import { ProfileNameRow } from './ProfileNameRow';

export const ProfileStickyHeaderHeight = 52;

export function ProfileStickyHeader() {
  return (
    <StickyHeader name="profile-header" visibleAtYPosition={44}>
      <Box
        background="body (Deprecated)"
        justifyContent="center"
        height={{ custom: ProfileStickyHeaderHeight }}
        paddingHorizontal="19px (Deprecated)"
        width="full"
        testID="profile-sticky-header"
      >
        <ProfileNameRow testIDPrefix="profile-name-sticky" />
      </Box>
    </StickyHeader>
  );
}
