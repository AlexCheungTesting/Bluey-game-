import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ImageBackground, useWindowDimensions } from 'react-native';
import { Audio } from 'expo-av';

const IMAGES = [
  require('./assets/images/Bingo.png'),
  require('./assets/images/Bluey.png'),
  require('./assets/images/BlueyDad.png'),
  require('./assets/images/BlueyFam.jpg'),
  require('./assets/images/BlueyMom.png'),
  require('./assets/images/Muffin.png'),
];

const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export default function App() {
  const { width, height } = useWindowDimensions();

  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);

  // Landscape logic
  const isLandscape = safeWidth > safeHeight;

  const boardWidth = Math.min(safeWidth, 650);
  const innerBoardWidth = Math.max(0, boardWidth - 10); // Account for paddingHorizontal: 5
  const cardMargin = Math.max(0, Math.floor(innerBoardWidth * 0.02));

  let cardWidth = Math.max(0, Math.floor((innerBoardWidth - (cardMargin * 8)) / 4));

  if (isLandscape) {
    // In landscape, we have 3 rows. The height of 3 rows + margins + padding (50px top) must fit.
    // Each card's height is cardWidth / 0.8 (since aspectRatio is 0.8).
    // Total vertical space needed for cards: 3 * (cardHeight + cardMargin * 2) + 50
    // So: 3 * ((cardWidth / 0.8) + cardMargin * 2) + 50 <= height
    // (cardWidth / 0.8) + cardMargin * 2 <= (height - 50) / 3
    // cardWidth / 0.8 <= ((height - 50) / 3) - (cardMargin * 2)
    // cardWidth <= (((height - 50) / 3) - (cardMargin * 2)) * 0.8

    const maxCardHeight = ((safeHeight - 50) / 3) - (cardMargin * 2);
    const constrainedWidth = Math.floor(maxCardHeight * 0.8);
    cardWidth = Math.max(0, Math.min(cardWidth, constrainedWidth));
  }

  // Calculate the strict container width based on the final cardWidth to ensure exactly 4 cards fit per row.
  const strictBoardWidth = Math.max(0, (cardWidth * 4) + (cardMargin * 8) + 10); // +10 for paddingHorizontal: 5
  const cardHeight = Math.floor(cardWidth * 1.25);

  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [lockBoard, setLockBoard] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const bgmSound = useRef(new Audio.Sound());
  const victoryBgmSound = useRef(new Audio.Sound());
  const popSound = useRef(new Audio.Sound());
  const successSound = useRef(new Audio.Sound());
  const failSound = useRef(new Audio.Sound());
  const victorySfxSound = useRef(new Audio.Sound());

  useEffect(() => {
    const initialCards = [...IMAGES, ...IMAGES].map((imageSource, id) => ({ id, imageSource }));
    setCards(shuffleArray(initialCards));

    let isMounted = true;

    const loadAndPlayBgm = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
        });

        await bgmSound.current.loadAsync(require('./assets/soundFX/Memory-bgm1.mp3'));
        await bgmSound.current.setIsLoopingAsync(true);
        await bgmSound.current.setVolumeAsync(0.2);

        await victoryBgmSound.current.loadAsync(require('./assets/soundFX/Victory-bgm1.mp3'));
        await victoryBgmSound.current.setIsLoopingAsync(true);
        await victoryBgmSound.current.setVolumeAsync(0.3);

        await popSound.current.loadAsync(require('./assets/soundFX/Pop-sfx.mp3'));
        await popSound.current.setVolumeAsync(1.0);

        await successSound.current.loadAsync(require('./assets/soundFX/Succes-sfx.mp3'));
        await successSound.current.setVolumeAsync(1.0);

        await failSound.current.loadAsync(require('./assets/soundFX/Fail-sfx.mp3'));
        await failSound.current.setVolumeAsync(1.0);

        await victorySfxSound.current.loadAsync(require('./assets/soundFX/Victory-sfx.mp3'));
        await victorySfxSound.current.setVolumeAsync(1.0);

        if (isMounted) {
          await bgmSound.current.playAsync();
        }
      } catch (error) {
        console.error("Error loading sounds", error);
      }
    };

    loadAndPlayBgm();

    return () => {
      isMounted = false;
      bgmSound.current.unloadAsync();
      victoryBgmSound.current.unloadAsync();
      popSound.current.unloadAsync();
      successSound.current.unloadAsync();
      failSound.current.unloadAsync();
      victorySfxSound.current.unloadAsync();
    };
  }, []);

  const isVictory = cards.length > 0 && matchedCards.length === cards.length;

  useEffect(() => {
    const handleVictorySounds = async () => {
      if (isVictory) {
        try {
          await bgmSound.current.stopAsync();
          await victorySfxSound.current.replayAsync();
          await victoryBgmSound.current.playAsync();
        } catch (error) {
          console.error("Error playing victory sounds", error);
        }
      }
    };
    handleVictorySounds();
  }, [isVictory]);

  const handleReplay = async () => {
    try {
      await victoryBgmSound.current.stopAsync();
      await bgmSound.current.playAsync();
    } catch (error) {
       console.error("Error replaying bgm", error);
    }
    setMatchedCards([]);
    setSelectedCards([]);
    setLockBoard(false);
    const initialCards = [...IMAGES, ...IMAGES].map((imageSource, id) => ({ id, imageSource }));
    setCards(shuffleArray(initialCards));
  };

  const playSound = async (soundRef) => {
    try {
      await soundRef.current.replayAsync();
    } catch (error) {
      console.error("Error playing sound", error);
    }
  };

  const handleCardPress = (index) => {
    if (lockBoard) return;
    if (selectedCards.includes(index) || matchedCards.includes(index)) return;

    playSound(popSound);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setLockBoard(true);
      const [firstIndex, secondIndex] = newSelected;

      if (cards[firstIndex].imageSource === cards[secondIndex].imageSource) {
        playSound(successSound);
        setMatchedCards((prev) => [...prev, firstIndex, secondIndex]);
        setSelectedCards([]);
        setLockBoard(false);
      } else {
        playSound(failSound);
        setTimeout(() => {
          setSelectedCards([]);
          setLockBoard(false);
        }, 1000);
      }
    }
  };

  const handleStartGame = () => {
    playSound(successSound);
    setGameStarted(true);
  };

  return (
    <ImageBackground
      style={styles.container}
      source={isVictory ? require('./assets/images/Bluey-background2.png') : require('./assets/images/Bluey-background1.png')}
      resizeMode="cover"
    >
      {!gameStarted ? (
        <View style={styles.startContainer}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
            <Text style={styles.startButtonText}>Start Memory game</Text>
          </TouchableOpacity>
        </View>
      ) : isVictory ? (
        <View style={styles.victoryContainer}>
          <Text style={styles.victoryText}>Hooray! You matched them all! 🎉</Text>
          <TouchableOpacity style={styles.replayButton} onPress={handleReplay}>
            <Text style={styles.replayButtonText}>Replay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.board, { width: strictBoardWidth }]}>
          {cards.map((card, index) => {
            const isFlipped = selectedCards.includes(index) || matchedCards.includes(index);
            return (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.card,
                  { width: cardWidth, height: cardHeight, margin: cardMargin },
                  isFlipped ? styles.cardFlipped : styles.cardHidden
                ]}
                onPress={() => handleCardPress(index)}
                activeOpacity={0.8}
              >
                {isFlipped ? (
                  <Image source={card.imageSource} style={styles.cardImage} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      <StatusBar style="auto" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // width is dynamically set inline to strictBoardWidth to strictly lock 4 columns
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  card: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHidden: {
    backgroundColor: '#333',
  },
  cardFlipped: {
    backgroundColor: '#fff',
  },
  cardText: {
    fontSize: 32,
  },
  cardImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  victoryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    flex: 1,
  },
  victoryText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#ffffff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  replayButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  replayButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  startContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  startButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  startButtonText: {
    color: '#333',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
