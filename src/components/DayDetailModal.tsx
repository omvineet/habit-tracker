import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Switch } from 'react-native';
import { formatFullDate } from '../utils/date';
import { AthleticPress } from './AthleticPress';
import { colors, fonts, radii } from '../theme';

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
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.kicker}>DAY LOG</Text>
          <Text style={styles.heading}>{formatFullDate(dateStr)}</Text>
          <Text style={styles.subheading}>Lock it in. Leave a note if you want.</Text>

          <View style={styles.doneRow}>
            <Text style={styles.label}>DONE</Text>
            <Switch
              value={done}
              onValueChange={setDone}
              trackColor={{ false: colors.line, true: colors.volt }}
              thumbColor={done ? colors.ink : colors.mute}
              accessibilityLabel="Mark day done"
            />
          </View>

          <Text style={styles.label}>NOTE</Text>
          <TextInput
            style={styles.input}
            placeholder="How did it go?"
            placeholderTextColor={colors.mute}
            value={noteText}
            onChangeText={setNoteText}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.actions}>
            <AthleticPress style={[styles.button, styles.buttonSecondary]} onPress={onClose}>
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </AthleticPress>
            <AthleticPress style={[styles.button, styles.buttonPrimary]} onPress={handleSave}>
              <Text style={styles.buttonPrimaryText}>Save</Text>
            </AthleticPress>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.asphalt,
    borderTopWidth: 3,
    borderTopColor: colors.volt,
    padding: 24,
    gap: 8,
  },
  kicker: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.volt,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 34,
    color: colors.chalk,
    textTransform: 'uppercase',
  },
  subheading: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.mute,
    marginBottom: 8,
  },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 1.5,
    color: colors.mute,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.tight,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 88,
    color: colors.chalk,
    backgroundColor: colors.panel,
    fontFamily: fonts.body,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.tight,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
  },
  buttonSecondaryText: {
    color: colors.chalk,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    letterSpacing: 1,
  },
  buttonPrimary: {
    backgroundColor: colors.volt,
  },
  buttonPrimaryText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    letterSpacing: 1,
  },
});
