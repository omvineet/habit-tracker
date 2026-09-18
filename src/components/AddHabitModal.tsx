import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

const EMOJI_CHOICES = ['🧘', '🏃', '📖', '💧', '🥗', '😴', '✍️', '🎯'];

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, emoji: string, targetDays: number) => void;
};

export function AddHabitModal({ visible, onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const [targetDays, setTargetDays] = useState('30');

  const reset = () => {
    setName('');
    setEmoji(EMOJI_CHOICES[0]);
    setTargetDays('30');
  };

  const handleCreate = () => {
    const trimmed = name.trim();
    const days = parseInt(targetDays, 10);
    if (!trimmed || !Number.isFinite(days) || days <= 0) return;
    onCreate(trimmed, emoji, days);
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>New habit</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Drink 2L water"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Icon</Text>
          <View style={styles.emojiRow}>
            {EMOJI_CHOICES.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                style={[styles.emojiChoice, e === emoji && styles.emojiChoiceSelected]}
              >
                <Text style={styles.emojiChoiceText}>{e}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Target days</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={targetDays}
            onChangeText={setTargetDays}
          />

          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.buttonSecondary]} onPress={onClose}>
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.buttonPrimary]} onPress={handleCreate}>
              <Text style={styles.buttonPrimaryText}>Create</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 8,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiChoice: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiChoiceSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  emojiChoiceText: {
    fontSize: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#F0F0F0',
  },
  buttonSecondaryText: {
    color: '#333',
    fontWeight: '600',
  },
  buttonPrimary: {
    backgroundColor: '#2E7D32',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontWeight: '600',
  },
});
