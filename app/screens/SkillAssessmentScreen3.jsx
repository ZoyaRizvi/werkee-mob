import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RadioButton } from 'react-native-paper';
import { ScrollView } from 'react-native';
import axios from 'axios';
import CustomButton from '../../components/CustomButton';

const generateQuestionsFromGemini = async (skill, level) => {
  try {
    const prompt = `Generate 10 multiple choice questions related to ${skill} at the ${level} level. Ensure the result is in JSON format, with questions, options, and correct answers correctly nested.`;

    const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBK9A3pPDR_lduTqoiBFFn4DUe-P9y8Kk4', {
      contents: [
        { parts: [{ text: prompt }] }
      ]
    });

    if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
      return [];
    }

    const fixedJsonText = fixJsonText(response.data.candidates[0].content.parts[0].text);
    try {
      const quizData = JSON.parse(fixedJsonText);
      return quizData.questions.map((question, index) => ({
        ...question,
        id: index
      }));
    } catch {
      return [];
    }
  } catch {
    return [];
  }
};

function fixJsonText(jsonText) {
  return jsonText
    .replace(/\n/g, '\n')
    .replace(/\t/g, '\t')
    .replace(/\"/g, '"')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ')
    .replace('```json', '')
    .replace('```', '');
}

const SkillAssessmentScreen = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [score, setScore] = useState(0);
  const [passStatus, setPassStatus] = useState('');

  const skillsList = ['Project Management', 'DevOps', 'Content Writing', 'Video Editing', 'Marketing', 'Technical Writing', 'SQA', 'Graphic Designing'];

  useFocusEffect(
    useCallback(() => {
      // Reset all states when the screen is focused
      setSelectedLevel(null);
      setSelectedSkill(null);
      setQuestions([]);
      setAnswers({});
      setScore(0);
      setPassStatus('');
      setShowScoreDialog(false);
    }, [])
  );

  useEffect(() => {
    const fetchQuestions = async () => {
      if (selectedSkill && selectedLevel) {
        setLoading(true);
        const fetchedQuestions = await generateQuestionsFromGemini(selectedSkill, selectedLevel);
        setQuestions(fetchedQuestions);
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [selectedSkill, selectedLevel]);

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
  };

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
  };

  const handleAnswerSelect = (questionId, option) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: option }));
  };

  const calculateScore = () => {
    const correctAnswers = questions.filter((q) => answers[q.id] === q.correctAnswer);
    const score = correctAnswers.length;
    setScore(score);
    setPassStatus(score >= questions.length / 2 ? 'Passed' : 'Failed');
    setShowScoreDialog(true);
  };

  return (
    <View style={styles.container}>
      {!selectedLevel && (
        <View style={styles.levelSelection}>
          <Text style={styles.title}>Select Your Level</Text>
          {['Entry', 'Basic', 'Intermediate', 'Advanced'].map((level) => (
            <CustomButton
              key={level}
              title={level}
              handlePress={() => handleLevelSelect(level)}
              containerStyles={{ backgroundColor: '#38B2AC' }}
            />
          ))}
        </View>
      )}

      {selectedLevel && !selectedSkill && (
        <View style={styles.skillSelection}>
          <Text style={styles.title}>Select a Skill (Level: {selectedLevel})</Text>
          {skillsList.map((skill) => (
            <CustomButton
              key={skill}
              title={skill}
              handlePress={() => handleSkillSelect(skill)}
              containerStyles={{ backgroundColor: '#38B2AC' }}
            />
          ))}
        </View>
      )}

      {selectedSkill && (
        <ScrollView style={styles.questionContainer}>
          <Text style={styles.title}>
            Skill Assessment for <Text style={styles.skillName}>{selectedSkill}</Text>
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color="#38B2AC" />
          ) : (
            <>
              {questions.length > 0 ? (
                <FlatList
                  data={questions}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.questionItem}>
                      <Text style={styles.questionText}>{item.question}</Text>
                      {item.options.map((option) => (
                        <View key={option} style={styles.radioButtonContainer}>
                          <RadioButton
                            value={option}
                            status={answers[item.id] === option ? 'checked' : 'unchecked'}
                            onPress={() => handleAnswerSelect(item.id, option)}
                          />
                          <Text style={styles.radioButtonText}>{option}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                />
              ) : (
                <Text>No questions available.</Text>
              )}
              <CustomButton
                title="Submit"
                handlePress={calculateScore}
                isLoading={loading}
                containerStyles={{ opacity: Object.keys(answers).length === questions.length ? 1 : 0.5 }}
                textStyles={{ color: '#FFF' }}
                disabled={Object.keys(answers).length !== questions.length}
              />
            </>
          )}
        </ScrollView>
      )}
      {/* Score Dialog */}
      {showScoreDialog && (
        <View style={styles.scoreDialogContainer}>
          <View style={styles.scoreDialog}>
            <Text style={styles.title}>{passStatus === 'Passed' ? 'Congratulations!' : 'Sorry!'}</Text>
            <Text style={styles.scoreText}>You scored {score} out of {questions.length}</Text>
            <CustomButton
              title="OK"
              handlePress={() => {
                setShowScoreDialog(false);
              }}
              containerStyles={{ backgroundColor: '#007AFF' }}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  skillName: { fontWeight: 'bold', color: '#38B2AC' },
  questionContainer: { marginTop: 20 },
  questionItem: { marginBottom: 20 },
  questionText: { fontSize: 18, marginBottom: 10 },
  radioButtonContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  radioButtonText: { marginLeft: 8 },
  scoreDialogContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scoreDialog: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  scoreText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default SkillAssessmentScreen;