import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { RadioButton } from 'react-native-paper';

const SkillAssessmentScreen3 = () => {
  const [checked, setChecked] = React.useState({});

  // Dummy JSON data for questions
  const questions = [
    {
      id: 1,
      question: "Which of the following is an essential element of effective content writing?",
      options: ["Clarity", "Conciseness", "Accuracy", "All of the above"]
    },
    {
      id: 2,
      question: "What is the purpose of keyword research in content writing?",
      options: [
        "To identify relevant terms to include in the content",
        "To improve the content’s visibility in search results",
        "To attract more readers",
        "To enhance the content’s overall quality"
      ]
    }
  ];

  const renderQuestion = (questionItem) => (
    <View key={questionItem.id} style={styles.questionContainer}>
      <Text style={styles.questionText}>{questionItem.question}</Text>
      <RadioButton.Group
        onValueChange={value =>
          setChecked(prevState => ({ ...prevState, [questionItem.id]: value }))
        }
        value={checked[questionItem.id]}
      >
        {questionItem.options.map((option, index) => (
          <View key={index} style={styles.radioButtonContainer}>
            <RadioButton value={option} />
            <Text>{option}</Text>
          </View>
        ))}
      </RadioButton.Group>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://example.com/profile-picture.jpg' }} // Replace with actual image URL
          style={styles.profileImage}
        />
        <View style={styles.breadcrumbContainer}>
          <Text style={styles.breadcrumbText}>Dashboard / Skillassessment</Text>
          <Text style={styles.pageTitle}>Skillassessment</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Main Title */}
        <Text style={styles.mainTitle}>Skill Assessment for Content Writing</Text>

        {/* Questions Section */}
        <View style={styles.questionSection}>
          <Text style={styles.questionTitle}>Questions:</Text>

          {/* Render Questions Dynamically */}
          {questions.map(renderQuestion)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop:50,
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  breadcrumbContainer: {
    flex: 1,
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#666',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  contentContainer: {
    padding: 20,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 20,
    textAlign: 'center',
  },
  questionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 15,
    marginBottom: 10,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default SkillAssessmentScreen3;


