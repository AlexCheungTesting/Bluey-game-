import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

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
    <View style={styles.container}>
      <Text style={styles.title}>Memory Game</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 320,
    justifyContent: 'center',
  },
  card: {
    width: 70,
    height: 90,
    margin: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
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
  },
  victoryText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  replayButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  replayButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
