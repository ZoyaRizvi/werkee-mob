import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { db } from '../../firebase/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const generateQuestionsFromGemini = async (skill, level) => {
  try {
    const prompt = `Generate 10 multiple choice questions related to ${skill} at the ${level} level. Ensure the result is in JSON format, with questions, options, and correct answers correctly nested.`;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBK9A3pPDR_lduTqoiBFFn4DUe-P9y8Kk4',
      {
        contents: [
          {
            parts: [
              { text: prompt },
            ],
          },
        ],
      }
    );

    // Log the raw response data for debugging
    console.log("Raw Response:", response.data);

    // Check if response data has the expected structure
    if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
      console.error("Invalid response structure:", response.data);
      return []; // Return an empty array if the structure is invalid
    }

    const fixedJsonText = fixJsonText(response.data.candidates[0].content.parts[0].text);
    
    // Attempt to parse the JSON
    try {
      const quizData = JSON.parse(fixedJsonText);

      // Check if quizData has a 'questions' property
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        console.error("Parsed data does not contain questions array:", quizData);
        return []; // Return an empty array if 'questions' is not an array
      }

      return quizData.questions; // Return the questions array to the calling function
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Response Data:", fixedJsonText); // Log the data that failed to parse
      return []; // Return an empty array in case of parsing error
    }
  } catch (error) {
    console.log("Error generating questions:", error);
    return []; // Return an empty array in case of request error
  }
};


// Function to fix JSON formatting issues in the API response
function fixJsonText(jsonText) {
  jsonText = jsonText.replace(/\n/g, "\n");
  jsonText = jsonText.replace(/\t/g, "\t");
  jsonText = jsonText.replace(/\"/g, '"');
  jsonText = jsonText.replace(/\r\n/g, "\n");
  jsonText = jsonText.replace(/\r/g, "\n");
  jsonText = jsonText.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
  jsonText = jsonText.replace("```json", "");
  jsonText = jsonText.replace("```", "");

  return jsonText;
}

const SkillAssessmentScreen = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [assessmentId, setAssessmentId] = useState(null);

  const skills = ['Project Management', 'DevOps', 'Content Writing', 'Video Editing', 'Marketing', 'Technical Writing', 'SQA', 'Graphic Designing'];

  useEffect(() => {
    const fetchOrGenerateQuestions = async () => {
      setLoading(true);
      try {
        const questionsSnapshot = await getDocs(collection(db, `assessments/${selectedSkill}_${selectedLevel}/questions`));

        if (questionsSnapshot.empty) {
          const generatedQuestions = await generateQuestionsFromGemini(selectedSkill, selectedLevel);

          if (Array.isArray(generatedQuestions)) {
            setQuestions(generatedQuestions);
            setAssessmentId(`${selectedSkill}_${selectedLevel}`);

            // Store generated questions in Firestore
            generatedQuestions.forEach(async (question) => {
              await setDoc(doc(db, `assessments/${selectedSkill}_${selectedLevel}/questions`, question.id), question);
            });
          } else {
            console.error("Error: generatedQuestions is not an array.");
            setQuestions([]); // Set empty questions array if the format is incorrect
          }
        } else {
          // Fetch questions from Firestore
          const fetchedQuestions = questionsSnapshot.docs.map(doc => doc.data());
          setQuestions(fetchedQuestions);
        }
      } catch (error) {
        console.error("Error fetching or generating questions:", error.message);
        setQuestions([]); // Handle the error by setting an empty array
      } finally {
        setLoading(false);
      }
    };

    if (selectedSkill && selectedLevel) {
      fetchOrGenerateQuestions();
    }
  }, [selectedSkill, selectedLevel]);

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
  };

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: answer }));
  };

  const calculateScore = async () => {
    let correctCount = 0;
    questions.forEach((question) => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correctCount += 1;
      }
    });

    setScore(correctCount);

    if (assessmentId) {
      const assessmentDocRef = doc(db, 'assessments', assessmentId);
      await setDoc(assessmentDocRef, { response: userAnswers, score: correctCount }, { merge: true });

      const auth = getAuth();
      const user = auth.currentUser;

      if (user && correctCount >= 8) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const existingBadges = userDoc.data()?.badges || [];

        if (!existingBadges.includes(selectedSkill)) {
          existingBadges.push(selectedSkill);
          await updateDoc(userDocRef, { badges: existingBadges });
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      {!selectedLevel && (
        <View style={styles.levelSelection}>
          <Text style={styles.title}>Select Your Level</Text>
          {['Entry', 'Basic', 'Intermediate', 'Advanced'].map((level) => (
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

      {selectedLevel && !selectedSkill && (
        <View style={styles.skillSelection}>
          <Text style={styles.title}>Select a Skill (Level: {selectedLevel})</Text>
          {skills.map((skill) => (
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

      {selectedLevel && selectedSkill && (
        <View style={styles.questionContainer}>
          <Text style={styles.title}>Questions for {selectedSkill} ({selectedLevel})</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <FlatList
              data={questions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.questionItem}>
                  <Text style={styles.questionText}>{item.question}</Text>
                  {item.options.map((option, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.button}
                      onPress={() => handleAnswerSelect(item.id, option)}
                    >
                      <Text style={styles.buttonText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          )}

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