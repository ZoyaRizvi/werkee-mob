import React, { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';

const SkillAssessmentScreen = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch questions when both level and skill are selected
  
  useEffect(() => {
    const getQuestions = async () => {
      const fetchedQuestions = await fetchQuestions(selectedSkill, selectedLevel);
      setQuestions(fetchedQuestions);
    };
  
    if (selectedSkill && selectedLevel) {
      getQuestions();
    }
  }, [selectedSkill, selectedLevel]);
  

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Example API call to fetch questions based on level and skill
      const response = await fetch(`https://werky-backend.onrender.com/api/assessment/${selectedLevel}/skill/${selectedSkill}`);
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle level selection
  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
  };

  // Handle skill selection
  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
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
                </View>
              )}
            />
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
    borderColor:'black',
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
});

export default SkillAssessmentScreen;



