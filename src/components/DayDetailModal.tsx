import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Switch } from 'react-native';
import { formatFullDate } from '../utils/date';

type Props = {
  visible: boolean;
  dateStr: string | null;
  completed: boolean;
  note: string;
  onClose: () => void;
  onSave: (details: { completed: boolean; note: string }) => void;
};

export function DayDetailModal({ visible, dateStr, completed, note, onClose, onSave }: Props) {
  const [done, setDone] = useState(completed);
  const [noteText, setNoteText] = useState(note);

  useEffect(() => {
    if (visible) {
      setDone(completed);
      setNoteText(note);
    }
  }, [visible, completed, note, dateStr]);

  if (!dateStr) return null;

  const handleSave = () => {
    onSave({ completed: done, note: noteText.trim() });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>{formatFullDate(dateStr)}</Text>
          <Text style={styles.subheading}>Mark the day and add an optional note.</Text>

          <View style={styles.doneRow}>
            <Text style={styles.label}>Done</Text>
            <Switch
              value={done}
              onValueChange={setDone}
              trackColor={{ false: '#ddd', true: '#A5D6A7' }}
              thumbColor={done ? '#2E7D32' : '#f4f3f4'}
              accessibilityLabel="Mark day done"
            />
          </View>

          <Text style={styles.label}>Note</Text>
          <TextInput
            style={styles.input}
            placeholder="How did it go?"
            value={noteText}
            onChangeText={setNoteText}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.buttonSecondary]} onPress={onClose}>
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.buttonPrimary]} onPress={handleSave}>
              <Text style={styles.buttonPrimaryText}>Save</Text>
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
    color: '#1a1a1a',
  },
  subheading: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
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
    minHeight: 88,
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
