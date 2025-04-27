import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import Icon from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');

// Setup track player
const setupPlayer = async () => {
  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });
  } catch (error) {
    console.log('Error setting up player:', error);
  }
};

// Sample track
const track = {
  id: '1',
  url: require('../assets/audio/song.mp3'),
  title: 'Toh Phir Aao',
  artist: 'Mustafa Zahid',
  album: 'Awarapan', // The movie where this song is from
  artwork: require('../assets/images/cover.png'),
  duration: 348, // approximately 4 minutes and 52 seconds
};

const MusicPlayer = () => {
  const playbackState = usePlaybackState();
  const progress = useProgress();

  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [lastSeekPosition, setLastSeekPosition] = useState(0);
  const seekDebounceRef = useRef(null);

  // Initialize player
  useEffect(() => {
    const setup = async () => {
      await setupPlayer();
      await TrackPlayer.add([track]);
      setIsPlayerReady(true);
    };

    setup();

    // Cleanup on unmount
    return () => {
      if (seekDebounceRef.current) {
        clearTimeout(seekDebounceRef.current);
      }
      // TrackPlayer.stop();
    };
  }, []);

  // Update playing state based on playback state
  useEffect(() => {
    if (playbackState?.state) {
      setIsPlaying(playbackState.state === State.Playing);
    }
  }, [playbackState]);

  // Update slider with current position when not seeking
  useEffect(() => {
    if (!isSeeking && progress.position) {
      // Only update if the difference is significant (more than 1 second)
      if (Math.abs(progress.position - lastSeekPosition) > 1) {
        setSliderValue(progress.position);
      }
    }
  }, [progress.position, isSeeking, lastSeekPosition]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const handlePrevious = async () => {
    await TrackPlayer.seekTo(0);
  };

  const handleNext = async () => {
    // In a real app, you'd skip to the next track here
    // For demo, just restart the current track
    await TrackPlayer.seekTo(0);
  };

  const handleSliderChange = value => {
    setSliderValue(value);
    setLastSeekPosition(value);
  };

  const handleSlidingStart = () => {
    setIsSeeking(true);
  };

  const handleSlidingComplete = async value => {
    // Set the final position
    setLastSeekPosition(value);

    // Clear any existing timeout
    if (seekDebounceRef.current) {
      clearTimeout(seekDebounceRef.current);
    }

    // Perform the seek operation
    await TrackPlayer.seekTo(value);

    // Keep seeking state true for a longer time to prevent flickering
    seekDebounceRef.current = setTimeout(() => {
      setIsSeeking(false);
    }, 1000);
  };

  if (!isPlayerReady) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <Text style={styles.songTitle}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Header with down arrow and menu dots */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="chevron-down" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerText}>PLAYING FROM PLAYLIST</Text>
          <Text style={styles.playlistName}>idk</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="ellipsis-horizontal" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Album Cover */}
      <View style={styles.coverContainer}>
        <Image
          source={track.artwork}
          style={styles.coverArt}
          resizeMode="cover"
        />
      </View>

      {/* Song Details */}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{track.title}</Text>
        <Text style={styles.songArtist}>{track.artist}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.progressBar}
          minimumValue={0}
          maximumValue={progress.duration || track.duration}
          value={sliderValue}
          onValueChange={handleSliderChange}
          onSlidingStart={handleSlidingStart}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor="#1DB954" // Spotify green
          maximumTrackTintColor="#404040"
          thumbTintColor="#FFFFFF"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(sliderValue)}</Text>
          <Text style={styles.timeText}>
            {formatTime(progress.duration || track.duration)}
          </Text>
        </View>
      </View>

      {/* Playback Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handlePrevious}>
          <Icon name="play-skip-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={handlePlayPause}>
          <Icon
            name={isPlaying ? 'pause' : 'play'}
            size={32}
            color="#000000"
            style={!isPlaying ? {marginLeft: 3} : {}}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
          <Icon name="play-skip-forward" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Helper function to format time
const formatTime = seconds => {
  if (!seconds || isNaN(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Spotify dark background
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 11,
    letterSpacing: 0.5,
    opacity: 0.6,
    fontWeight: '500',
    marginBottom: 2,
  },
  playlistName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  coverContainer: {
    width: width - 40,
    height: width - 40,
    alignSelf: 'center',
    marginTop: 80,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  coverArt: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  songInfo: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  songArtist: {
    color: '#b3b3b3',
    fontSize: 15,
    fontWeight: '400',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 35,
  },
  progressBar: {
    width: '100%',
    height: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  timeText: {
    color: '#b3b3b3',
    fontSize: 12,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
  },
  controlButton: {
    marginHorizontal: 25,
    padding: 10,
  },
  playPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
});

export default MusicPlayer;
