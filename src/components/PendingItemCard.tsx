import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';

type Props = {
  id: string;
  method: string;
  url: string;
  body?: any;
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
};

function PendingItemCardComponent({ id, method, url, body, onRetry, onRemove }: Props) {
  const onPressRetry = useCallback(() => onRetry?.(id), [onRetry, id]);
  const onPressRemove = useCallback(() => onRemove?.(id), [onRemove, id]);
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.method}>{method}</Text>
        <Text numberOfLines={1} style={styles.url}>{url}</Text>
        {body ? <Text numberOfLines={1} style={styles.body}>{JSON.stringify(body)}</Text> : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onPressRetry} style={styles.actionBtn}>
          <Text style={styles.actionText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressRemove} style={[styles.actionBtn, styles.remove]}>
          <Text style={styles.actionText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default React.memo(PendingItemCardComponent);
