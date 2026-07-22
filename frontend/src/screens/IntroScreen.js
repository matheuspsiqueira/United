import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const { width, height } = Dimensions.get('window');

// Tempo máximo de espera antes de forçar a navegação,
// caso o vídeo não carregue por algum motivo.
const FALLBACK_TIMEOUT_MS = 4000;

export default function IntroScreen({ onFinish }) {
  const finishedRef = useRef(false);

  const player = useVideoPlayer(
    require('../assets/loading.mp4'),
    (player) => {
      player.muted = true;
      player.loop = false;
      player.play();
    }
  );

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  };

  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      finish();
    });

    const fallback = setTimeout(finish, FALLBACK_TIMEOUT_MS);

    return () => {
      subscription.remove();
      clearTimeout(fallback);
    };
  }, [player]);

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    backgroundColor: '#0B0D12',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});