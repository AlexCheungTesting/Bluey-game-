import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ImageBackground, useWindowDimensions } from 'react-native';

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
  const { width } = useWindowDimensions();
  const boardWidth = Math.min(width, 650);
  const innerBoardWidth = boardWidth - 10; // Account for paddingHorizontal: 5
  const cardMargin = Math.floor(innerBoardWidth * 0.02);
  const cardWidth = Math.floor((innerBoardWidth - (cardMargin * 8)) / 4);

  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [lockBoard, setLockBoard] = useState(false);

  useEffect(() => {
    const initialCards = [...IMAGES, ...IMAGES].map((imageSource, id) => ({ id, imageSource }));
    setCards(shuffleArray(initialCards));
  }, []);

  const isVictory = cards.length > 0 && matchedCards.length === cards.length;

  const handleReplay = () => {
    setMatchedCards([]);
    setSelectedCards([]);
    setLockBoard(false);
    const initialCards = [...IMAGES, ...IMAGES].map((imageSource, id) => ({ id, imageSource }));
    setCards(shuffleArray(initialCards));
  };

  const handleCardPress = (index) => {
    if (lockBoard) return;
    if (selectedCards.includes(index) || matchedCards.includes(index)) return;

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setLockBoard(true);
      const [firstIndex, secondIndex] = newSelected;

      if (cards[firstIndex].imageSource === cards[secondIndex].imageSource) {
        setMatchedCards((prev) => [...prev, firstIndex, secondIndex]);
        setSelectedCards([]);
        setLockBoard(false);
      } else {
        setTimeout(() => {
          setSelectedCards([]);
          setLockBoard(false);
        }, 1000);
      }
    }
  };

  return (
    <ImageBackground
      style={styles.container}
      source={isVictory ? require('./assets/images/Bluey-background2.png') : require('./assets/images/Bluey-background1.png')}
      resizeMode="cover"
    >
      {isVictory ? (
        <View style={styles.victoryContainer}>
          <Text style={styles.victoryText}>Hooray! You matched them all! 🎉</Text>
          <TouchableOpacity style={styles.replayButton} onPress={handleReplay}>
            <Text style={styles.replayButtonText}>Replay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.board}>
          {cards.map((card, index) => {
            const isFlipped = selectedCards.includes(index) || matchedCards.includes(index);
            return (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.card,
                  { width: cardWidth, aspectRatio: 0.8, margin: cardMargin },
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
    width: '100%',
    maxWidth: 650,
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
});
