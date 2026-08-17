import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { useVideoPlayer, VideoView } from 'expo-video';

import { COLORS, FONTS } from '../../theme/colors';

export default function UnitedNewsPlayerScreen({ route, navigation }) {
  const { unitedNews } = route.params;

  const player = useVideoPlayer(unitedNews?.video ?? null, (p) => {
    p.loop = false;
  });

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return undefined;
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
      return () => {
        NavigationBar.setVisibilityAsync('visible');
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTag}>UNITED NEWS</Text>
          <Text style={styles.headerTitle}>{unitedNews.mes_referencia}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="close" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.playerWrapper}>
        <VideoView style={styles.video} player={player} allowsFullscreen allowsPictureInPicture nativeControls />
      </View>
    </SafeAreaView>
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