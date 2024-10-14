import React, { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';

// Gemini API function (dummy for now, replace with actual API call)
const generateQuestionsFromGemini = async (skill, level) => {
  // Replace this with a real call to Gemini API to generate questions
  return [
    { id: '1', question: `What is ${skill}?`, correctAnswer: 'Explanation of the skill' },
    { id: '2', question: `Explain one example of ${skill}?`, correctAnswer: 'An example explanation' }
  ];
};

const SkillAssessmentScreen = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);

  // Fetch questions from Firestore or Gemini API
  useEffect(() => {
    const fetchOrGenerateQuestions = async () => {
      setLoading(true);
      try {
        const questionsSnapshot = await firestore()
          .collection('assessments')
          .doc(`${selectedSkill}_${selectedLevel}`)
          .collection('questions')
          .get();
        
        if (questionsSnapshot.empty) {
          // If no questions exist in Firestore, generate using Gemini API
          const generatedQuestions = await generateQuestionsFromGemini(selectedSkill, selectedLevel);
          setQuestions(generatedQuestions);

          // Store generated questions in Firebase
          generatedQuestions.forEach(async (question) => {
            await firestore()
              .collection('assessments')
              .doc(`${selectedSkill}_${selectedLevel}`)
              .collection('questions')
              .doc(question.id)
              .set(question);
          });
        } else {
          // Fetch existing questions from Firestore
          const fetchedQuestions = questionsSnapshot.docs.map(doc => doc.data());
          setQuestions(fetchedQuestions);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedSkill && selectedLevel) {
      fetchOrGenerateQuestions();
    }
  }, [selectedSkill, selectedLevel]);

  // Handle level selection
  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
  };

  // Handle skill selection
  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
  };

  // Handle answer selection for a question
  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: answer }));
  };

  // Function to calculate user's score
  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((question) => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correctCount += 1;
      }
    });
    setScore(correctCount);
  };

  return (
    <View style={styles.container}>
      {/* Render level selection */}
      {!selectedLevel && (
        <View style={styles.levelSelection}>
          <Text style={styles.title}>Select Your Level</Text>
          {['ENTRY', 'BASIC', 'INTERMEDIATE', 'ADVANCED'].map((level) => (
            <TouchableOpacity
              key={level}
              style={styles.button}
              onPress={() => handleLevelSelect(level)}
            >
              <Text style={styles.buttonText}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Render skill selection after level is chosen */}
      {selectedLevel && !selectedSkill && (
        <View style={styles.skillSelection}>
          <Text style={styles.title}>Select a Skill (Level: {selectedLevel})</Text>
          {['PROJECT MANAGEMENT', 'DEVOPS', 'CONTENT WRITING', 'VIDEO EDITING', 'MARKETING', 'TECHNICAL WRITING', 'SQA', 'GRAPHIC DESIGNING'].map((skill) => (
            <TouchableOpacity
              key={skill}
              style={styles.button}
              onPress={() => handleSkillSelect(skill)}
            >
              <Text style={styles.buttonText}>{skill}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setSelectedLevel(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back to Level Selection</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Render questions after both level and skill are selected */}
      {selectedLevel && selectedSkill && (
        <View style={styles.questionContainer}>
          <Text style={styles.title}>Questions for {selectedSkill} ({selectedLevel})</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <FlatList
              data={questions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.questionItem}>
                  <Text style={styles.questionText}>{item.question}</Text>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleAnswerSelect(item.id, 'userAnswer')}
                  >
                    <Text style={styles.buttonText}>Answer</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          {/* Calculate and show score */}
          <TouchableOpacity onPress={calculateScore} style={styles.backButton}>
            <Text style={styles.backButtonText}>Submit and Calculate Score</Text>
          </TouchableOpacity>
          
          {score !== null && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>Your Score: {score} / {questions.length}</Text>
            </View>
          )}

          <TouchableOpacity onPress={() => setSelectedSkill(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back to Skill Selection</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 10,
    borderColor: 'black',
    borderRadius: 10,
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'teal',
    borderRadius: 5,
  },
  backButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  questionContainer: {
    flex: 1,
  },
  questionItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  questionText: {
    fontSize: 18,
  },
  scoreContainer: {
    marginTop: 20,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SkillAssessmentScreen;




