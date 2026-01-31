import { Platform } from "react-native";

/**
 * Shared virtualization config for FlatList / virtualized lists.
 * Use these props to limit rendered items and improve scroll performance.
 */
/** Pass these to FlatList for virtualization; omit getItemLayout unless items have fixed height */
export const listVirtualizationConfig = {
  initialNumToRender: 12,
  maxToRenderPerBatch: 10,
  windowSize: 6,
  removeClippedSubviews: Platform.OS === "android",
};

/** Use when list items have fixed height (e.g. CARD_HEIGHT + marginBottom) for best perf */
export function getFixedItemLayout(
  itemHeight: number,
  separatorHeight = 0
): (data: unknown[] | null, index: number) => { length: number; offset: number; index: number } {
  return (_data, index) => ({
    length: itemHeight + separatorHeight,
    offset: (itemHeight + separatorHeight) * index,
    index,
  });
}
