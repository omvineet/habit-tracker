import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { AthleticPress } from './AthleticPress';
import { colors, fonts, radii } from '../theme';

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
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.kicker}>NEW CHALLENGE</Text>
          <Text style={styles.heading}>New habit</Text>

          <Text style={styles.label}>NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Drink 2L water"
            placeholderTextColor={colors.mute}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>MARK</Text>
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

          <Text style={styles.label}>TARGET DAYS</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={targetDays}
            onChangeText={setTargetDays}
            placeholderTextColor={colors.mute}
          />

          <View style={styles.actions}>
            <AthleticPress style={[styles.button, styles.buttonSecondary]} onPress={onClose}>
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </AthleticPress>
            <AthleticPress style={[styles.button, styles.buttonPrimary]} onPress={handleCreate}>
              <Text style={styles.buttonPrimaryText}>Create</Text>
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
    fontSize: 36,
    lineHeight: 38,
    color: colors.chalk,
    marginBottom: 8,
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
    color: colors.chalk,
    backgroundColor: colors.panel,
    fontFamily: fonts.body,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiChoice: {
    width: 44,
    height: 44,
    borderRadius: radii.tight,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
  },
  emojiChoiceSelected: {
    borderColor: colors.volt,
    backgroundColor: '#2A330F',
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
