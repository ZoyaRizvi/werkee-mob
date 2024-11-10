import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Modal, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RadioButton } from 'react-native-paper';
import { db } from '../../firebase/firebase';
import { updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import CustomButton from '../../components/CustomButton';
import axios from 'axios';
import { useRouter } from "expo-router";

const generateQuestionsFromGemini = async (skill, level) => {
  try {
    const prompt = `Generate 10 multiple choice questions related to ${skill} at the ${level} level. Ensure the result is in JSON format, with questions, options, and correct answers correctly nested.`;
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBK9A3pPDR_lduTqoiBFFn4DUe-P9y8Kk4',
      { contents: [{ parts: [{ text: prompt }] }] }
    );

    if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
      return [];
    }

    const fixedJsonText = fixJsonText(response.data.candidates[0].content.parts[0].text);
    try {
      const quizData = JSON.parse(fixedJsonText);
      const formattedQuestions = quizData.questions.map((question, index) => ({
        id: index,
        question: question.question,
        options: question.options,
        correct_answer: question.correctAnswer
      }));

      await saveQuestionsToFirebase(skill, level, formattedQuestions);

      return formattedQuestions;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return [];
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    return [];
  }
};

const saveQuestionsToFirebase = async (skill, level, questions) => {
  try {
    const docRef = doc(db, 'assessment', `${skill}_${level}`);
    const quizData = questions.reduce((acc, question, idx) => {
      acc[idx] = {
        question: question.question,
        options: question.options,
        correct_answer: question.correct_answer
      };
      return acc;
    }, {});

    await setDoc(docRef, { skill, level, quizData });
    console.log('Questions successfully saved to Firebase');
  } catch (error) {
    console.error('Error saving questions to Firebase:', error);
  }
};

const fixJsonText = (jsonText) => {
  return jsonText.replace(/\n/g, '\n').replace(/\t/g, '\t').replace(/\"/g, '"')
    .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ')
    .replace('```json', '').replace('```', '');
};

const SkillAssessmentScreen = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [score, setScore] = useState(0);
  const [passStatus, setPassStatus] = useState('');
  const router = useRouter();

  const skillsList = ['Project Management', 'DevOps', 'Content Writing', 'Video Editing', 'Marketing', 'Technical Writing', 'SQA', 'Graphic Designing'];

  useFocusEffect(
    useCallback(() => {
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

  const handleLevelSelect = (level) => setSelectedLevel(level);
  const handleSkillSelect = (skill) => setSelectedSkill(skill);

  const handleAnswerChange = (questionIndex, option) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionIndex]: option }));
  };

  const isAllAnswered = () => questions.length > 0 && questions.length === Object.keys(answers).length;

  const calculateScore = (quizData) => {
    let correctCount = 0;
    quizData.forEach((question, index) => {
      const correctAnswer = question.correct_answer;
      const userAnswer = answers[index];
      if (userAnswer === correctAnswer) {
        correctCount += 1;
      }
    });
    return correctCount;
  };

  function handleDialogClose() {
    setShowScoreDialog(false);
  
    if (passStatus === 'Passed') {
      // Navigate to profile if the user has passed
      router.push("/candidate/home");
    } else {
      // Reset the assessment if the user has failed
      setSelectedSkill(null);
      setSelectedLevel(null);
      setAnswers({});
      setScore(0);
      setPassStatus('');
      setQuestions([]);
    }
  }

  const handleSubmit = async () => {
    if (selectedSkill && selectedLevel) {
      try {
        const assessmentDocRef = doc(db, 'assessment', `${selectedSkill}_${selectedLevel}`);
        const assessmentDoc = await getDoc(assessmentDocRef);
        const assessmentData = assessmentDoc.data();
        const quizData = Object.values(assessmentData.quizData);

        const userScore = calculateScore(quizData);
        await updateDoc(assessmentDocRef, { response: answers, score: userScore });

        const status = userScore >= 8 ? 'Passed' : 'Failed';
        setPassStatus(status);

        if (status === 'Passed') {
          const auth = getAuth();
          const user = auth.currentUser;
          if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.data();
            const badges = userData.badges || [];
            if (!badges.includes(selectedSkill)) {
              badges.push(selectedSkill);
              await updateDoc(userDocRef, { badges });
            }
          }
        }
        setScore(userScore);
        setShowScoreDialog(true);
      } catch (error) {
        console.error("Error saving responses and score:", error);
      }
    }
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
              containerStyles={styles.levelButton}
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
              containerStyles={styles.skillButton}
            />
          ))}
        </View>
      )}

      {selectedSkill && (
        <ScrollView style={styles.questionContainer}>
          <Text style={styles.title}>Skill Assessment for <Text style={styles.skillName}>{selectedSkill}</Text></Text>
          {loading ? (
            <ActivityIndicator size="large" color="#38B2AC" style={styles.loadingIndicator} />
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
                            onPress={() => handleAnswerChange(item.id, option)}
                            color="#38B2AC"
                          />
                          <Text style={styles.radioButtonText}>{option}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                />
              ) : (
                <Text style={styles.noQuestionsText}>No questions available.</Text>
              )}
              <CustomButton
                title="Submit"
                handlePress={handleSubmit}
                isLoading={loading}
                disabled={!isAllAnswered()}
                containerStyles={styles.submitButton}
              />
            </>
          )}
        </ScrollView>
      )}

      <Modal visible={showScoreDialog} animationType="slide" transparent>
        <View style={styles.dialog}>
          <Text style={[styles.dialogTitle, { color: passStatus === 'Passed' ? 'teal' : 'red' }]}>
            {passStatus === 'Passed' ? 'Congratulations!' : 'Try Again!'}
          </Text>
          <Text style={styles.dialogContent}>
            You scored {score} out of {questions.length}
          </Text>
          <CustomButton title="Close" handlePress={handleDialogClose} containerStyles={styles.closeButton} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  skillName: { color: '#38B2AC', fontWeight: 'bold' },
  levelSelection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  levelButton: { marginBottom: 10 },
  skillSelection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  skillButton: { marginBottom: 10 },
  questionContainer: { marginBottom: 20 },
  questionItem: { marginBottom: 15 },
  questionText: { fontSize: 18, fontWeight: '500', color: '#333' },
  radioButtonContainer: { flexDirection: 'row', alignItems: 'center' },
  radioButtonText: { marginLeft: 8, fontSize: 16 },
  loadingIndicator: { marginVertical: 20 },
  submitButton: { marginTop: 20 },
  noQuestionsText: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 20 },
  dialog: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  dialogTitle: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
  dialogContent: { fontSize: 18, textAlign: 'center', marginBottom: 20 },
  closeButton: { marginTop: 10 },
});

export default SkillAssessmentScreen;
