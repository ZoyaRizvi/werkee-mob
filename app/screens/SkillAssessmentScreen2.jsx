import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const SkillAssessmentScreen2 = () => {
  const [modalVisible, setModalVisible] = React.useState(true);

  const skills = [
    "PROJECT MANAGEMENT",
    "DEVOPS",
    "CONTENT WRITING",
    "VIDEO EDITING",
    "MARKETING",
    "TECHNICAL WRITING",
    "SQA",
    "GRAPHIC DESIGNING",
  ];

  const renderSkillButtons = () => {
    return skills.map((skill, index) => (
      <TouchableOpacity key={index} style={styles.skillButton}>
        <Text style={styles.skillText}>{skill}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      {/* Modal for Skill Selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select a Skill</Text>
            <View style={styles.skillContainer}>{renderSkillButtons()}</View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  skillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  skillButton: {
    width: '45%',
    padding: 10,
    margin: 5,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    borderRadius: 5,
    borderColor: '#000000',
    borderWidth: 1,
  },
  skillText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SkillAssessmentScreen2;
