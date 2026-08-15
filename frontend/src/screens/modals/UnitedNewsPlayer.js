import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';

import { COLORS, FONTS } from '../../theme/colors';

export default function UnitedNewsPlayerModal({ visible, unitedNews, onClose }) {
  const player = useVideoPlayer(unitedNews?.video ?? null, (p) => {
    p.loop = false;
  });

  React.useEffect(() => {
    if (visible && player) player.play();
    if (!visible && player) player.pause();
  }, [visible, player]);

  if (!unitedNews) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTag}>UNITED NEWS</Text>
            <Text style={styles.headerTitle}>{unitedNews.mes_referencia}</Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={26} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.playerWrapper}>
          <VideoView
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
            nativeControls
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTag: { fontFamily: FONTS.mono, fontSize: 11, letterSpacing: 1, color: COLORS.textSecondary },
  headerTitle: { fontFamily: FONTS.displaySemiBold, fontSize: 18, color: COLORS.textPrimary, marginTop: 2 },

  playerWrapper: { flex: 1, justifyContent: 'center', backgroundColor: '#000' },
  video: { width: '100%', aspectRatio: 16 / 9 },
});