import React, {useState, useCallback, useRef} from 'react';
import {View, StyleSheet, TouchableHighlight, TouchableOpacity} from 'react-native';
import Animated from 'react-native-reanimated';
import {useSafeArea} from 'react-native-safe-area-context';
import BottomSheetRaw from 'reanimated-bottom-sheet';

import {Box} from './Box';
import {Icon} from './Icon';

const {abs, sub, pow} = Animated;

interface ContentProps {
  isExpanded: boolean;
  toggleExpanded: () => void;
  children?: React.ReactElement;
}

const SheetContentsContainer = ({children, isExpanded, toggleExpanded}: ContentProps) => {
  const content = (
    <Box backgroundColor="overlayBackground" minHeight="100%">
      <Box marginTop="l">{children}</Box>
    </Box>
  );

  if (isExpanded) {
    return content;
  }

  return <TouchableHighlight onPress={toggleExpanded}>{content}</TouchableHighlight>;
};

export interface BottomSheetProps {
  collapsedContent?: React.ReactElement;
  children?: React.ReactElement;
  extraContent?: boolean;
}

const SNAP_POINTS = ['100%', '20%'];
const SNAP_POINTS_LARGE = ['100%', '30%'];

export const BottomSheet = ({children, collapsedContent, extraContent}: BottomSheetProps) => {
  const bottomSheetPosition = useRef(new Animated.Value(1));
  const bottomSheetRef: React.Ref<BottomSheetRaw> = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = useCallback(() => {
    if (isExpanded) {
      bottomSheetRef.current?.snapTo(1);
    } else {
      bottomSheetRef.current?.snapTo(0);
    }
  }, [isExpanded]);

  const insets = useSafeArea();
  const renderHeader = useCallback(() => <Box height={insets.top} />, [insets.top]);

  const onOpenEnd = useCallback(() => setIsExpanded(true), []);
  const onCloseEnd = useCallback(() => setIsExpanded(false), []);

  const expandedContentWrapper = (
    <Animated.View style={{opacity: abs(sub(bottomSheetPosition.current, 1))}}>
      {children}
      <TouchableOpacity onPress={toggleExpanded} style={styles.collapseButton}>
        <Icon name="icon-chevron" />
      </TouchableOpacity>
    </Animated.View>
  );
  const collapsedContentWrapper = (
    <Animated.View style={{...styles.collapseContent, opacity: pow(bottomSheetPosition.current, 2)}}>
      <View style={styles.collapseContentHandleBar}>
        <Icon name="sheet-handle-bar" />
      </View>
      {collapsedContent}
    </Animated.View>
  );
  const renderContent = useCallback(() => {
    return (
      <SheetContentsContainer isExpanded={isExpanded} toggleExpanded={toggleExpanded}>
        <>
          {collapsedContentWrapper}
          {expandedContentWrapper}
        </>
      </SheetContentsContainer>
    );
  }, [collapsedContentWrapper, expandedContentWrapper, isExpanded, toggleExpanded]);

  const snapPoints = extraContent ? SNAP_POINTS_LARGE : SNAP_POINTS;

  return (
    <>
      <BottomSheetRaw
        ref={bottomSheetRef}
        borderRadius={32}
        enabledContentGestureInteraction
        renderContent={renderContent}
        onOpenEnd={onOpenEnd}
        onCloseEnd={onCloseEnd}
        renderHeader={renderHeader}
        snapPoints={snapPoints}
        initialSnap={1}
        callbackNode={bottomSheetPosition.current}
      />
      <Box height={snapPoints[1]} style={styles.spacer} />
    </>
  );
};

const styles = StyleSheet.create({
  collapseContent: {
    position: 'absolute',
    width: '100%',
  },
  collapseContentHandleBar: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    top: -24,
  },
  collapseButton: {
    position: 'absolute',
    top: 0,
    right: 15,
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{rotate: '90deg'}],
  },
  spacer: {
    marginBottom: -18,
  },
});
