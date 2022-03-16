import { GestureResponderEvent } from 'react-native';
import { Gesture } from '../types';

export function analyze(
  gestureEvent: GestureResponderEvent,
  startX: number,
  startY: number,
  startTimestamp: number,
): Gesture {
  const { locationX, locationY, timestamp } = gestureEvent.nativeEvent;

  const gesture = {
    isSwipe: false,
    isHorizontalSwipe: false,
    isVerticalSwipe: false,
    isRightSwipe: false,
    isLeftSwipe: false,
    isBackSwipe: false,
    isLong: false,
  };

  const xDelta = locationX - startX;
  const yDelta = locationY - startY;
  const xAbsDelta = Math.abs(xDelta);
  const yAbsDelta = Math.abs(yDelta);

  if (timestamp - startTimestamp > LONG_THRESHOLD_MS) {
    gesture.isLong = true;
  }

  if (xAbsDelta > SWIPE_THRESHOLD || yAbsDelta > SWIPE_THRESHOLD) {
    gesture.isSwipe = true;
  }

  if (xAbsDelta / yAbsDelta > 4) {
    gesture.isHorizontalSwipe = true;
    const dir = xDelta > 0 ? `isRightSwipe` : `isLeftSwipe`;
    gesture[dir] = true;
  }

  if (yAbsDelta / xAbsDelta > 4) {
    gesture.isVerticalSwipe = true;
  }

  if (gesture.isRightSwipe && startX < 35) {
    gesture.isHorizontalSwipe = true;
    gesture.isRightSwipe = true;
    gesture.isBackSwipe = true;
  }

  return gesture;
}

const SWIPE_THRESHOLD = 5;
const LONG_THRESHOLD_MS = 150;
