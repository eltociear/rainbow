import * as React from 'react';
import { Text as NativeText } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ButtonPressAnimation } from '@/components/animations';
import { ImgixImage } from '@/components/images';
import Skeleton from '@/components/skeleton/Skeleton';
import { AccentColorProvider, Box, Cover, useColorMode } from '@/design-system';
import { maybeSignUri } from '@/handlers/imgix';
import {
  useAccountProfile,
  useLatestCallback,
  useOnAvatarPress,
  usePersistentDominantColorFromImage,
} from '@/hooks';
import { useTheme } from '@/theme';
import { getFirstGrapheme } from '@/utils';
import ContextMenu from '@/components/native-context-menu/contextMenu';

export const ProfileAvatarRowHeight = 80;
export const ProfileAvatarSize = 80;

export function ProfileAvatarRow({
  size = ProfileAvatarSize,
}: {
  size?: number;
}) {
  // ////////////////////////////////////////////////////
  // Account

  const { accountSymbol, accountColor, accountImage } = useAccountProfile();

  const {
    avatarActionSheetOptions,
    onAvatarPress: onAvatarPressActionSheet,
    onAvatarPressProfile,
    onSelectionCallback,
  } = useOnAvatarPress({ screenType: 'wallet' });

  const { result: dominantColor } = usePersistentDominantColorFromImage(
    maybeSignUri(accountImage ?? '') ?? ''
  );

  // ////////////////////////////////////////////////////
  // Action Sheet (iOS) / Context Menu (Android)

  const ContextMenuButton =
    ios || onAvatarPressProfile ? React.Fragment : ContextMenu;

  const menuConfig = React.useMemo(
    () => ({
      menuItems: avatarActionSheetOptions?.map(label => ({
        actionKey: label,
        actionTitle: label,
      })),
    }),
    [avatarActionSheetOptions]
  );

  const handlePressMenuItem = useLatestCallback((e: any) => {
    const index = menuConfig.menuItems?.findIndex(
      item => item.actionKey === e.nativeEvent.actionKey
    );
    onSelectionCallback(index);
  });

  // ////////////////////////////////////////////////////
  // Colors

  const { colors } = useTheme();

  const { colorMode } = useColorMode();

  let accentColor = colors.skeleton;
  if (accountImage) {
    accentColor = dominantColor || colors.skeleton;
  } else if (typeof accountColor === 'number') {
    accentColor = colors.avatarBackgrounds[accountColor];
  }

  // ////////////////////////////////////////////////////
  // Animations

  const hasLoaded = accountSymbol || accountImage;

  const opacity = useDerivedValue(() => {
    return hasLoaded ? 1 : 0;
  });
  const fadeInStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(opacity.value, {
        duration: 100,
        easing: Easing.linear,
      }),
    };
  });

  const scale = useDerivedValue(() => {
    return hasLoaded ? 1 : 0.9;
  });
  const expandStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(scale.value, {
            damping: 12,
            restDisplacementThreshold: 0.001,
            restSpeedThreshold: 0.001,
            stiffness: 280,
          }),
        },
      ],
    };
  });

  return (
    <AccentColorProvider color={accentColor}>
      <Animated.View style={[expandStyle]}>
        <ContextMenuButton
          /* @ts-expect-error – JS component */
          menuConfig={menuConfig}
          onPressMenuItem={handlePressMenuItem}
        >
          <ButtonPressAnimation
            onPress={ios ? onAvatarPressActionSheet : onAvatarPressProfile}
            scale={0.8}
            testID="avatar-button"
          >
            <Box
              alignItems="center"
              background="accent"
              borderRadius={size / 2}
              height={{ custom: size }}
              justifyContent="center"
              shadow={
                hasLoaded
                  ? {
                      custom: {
                        ios: [
                          {
                            offset: { x: 0, y: 2 },
                            blur: 8,
                            opacity: 0.08,
                            color: 'shadow',
                          },
                          {
                            offset: { x: 0, y: 8 },
                            blur: 24,
                            opacity: 0.3,
                            color: colorMode === 'dark' ? 'shadow' : 'accent',
                          },
                        ],
                        android: {
                          elevation: 30,
                          opacity: 0.8,
                          color: colorMode === 'dark' ? 'shadow' : 'accent',
                        },
                      },
                    }
                  : undefined
              }
              style={{
                backgroundColor: accountImage ? colors.skeleton : accentColor,
              }}
              width={{ custom: size }}
            >
              <>
                {!hasLoaded && (
                  <Cover alignHorizontal="center">
                    <Box height={{ custom: size }} width="full">
                      <Skeleton animated>
                        <Box
                          background="body (Deprecated)"
                          borderRadius={size / 2}
                          height={{ custom: size }}
                          width={{ custom: size }}
                        />
                      </Skeleton>
                    </Box>
                  </Cover>
                )}
                <Animated.View style={[fadeInStyle]}>
                  {accountImage ? (
                    <Box
                      as={ImgixImage}
                      borderRadius={size / 2}
                      height={{ custom: size }}
                      source={{ uri: accountImage }}
                      width={{ custom: size }}
                    />
                  ) : (
                    <EmojiAvatar size={size} />
                  )}
                </Animated.View>
              </>
            </Box>
          </ButtonPressAnimation>
        </ContextMenuButton>
      </Animated.View>
    </AccentColorProvider>
  );
}

export function EmojiAvatar({ size }: { size: number }) {
  const { colors } = useTheme();
  const { accountColor, accountSymbol } = useAccountProfile();

  const accentColor =
    accountColor !== undefined
      ? colors.avatarBackgrounds[accountColor]
      : colors.skeleton;

  return (
    <AccentColorProvider color={accentColor}>
      <Box
        background="accent"
        borderRadius={size / 2}
        height={{ custom: size }}
        width={{ custom: size }}
      >
        <Cover alignHorizontal="center" alignVertical="center">
          <Box>
            <NativeText style={{ fontSize: ios ? 48 : 36, color: 'white' }}>
              {typeof accountSymbol === 'string' &&
                getFirstGrapheme(accountSymbol.toUpperCase())}
            </NativeText>
          </Box>
        </Cover>
      </Box>
    </AccentColorProvider>
  );
}
