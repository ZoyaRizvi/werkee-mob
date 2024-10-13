import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';

const SkillAssessment = () => {
  const [modalVisible, setModalVisible] = useState(true); // For modal visibility

  return (
    <SafeAreaView style={styles.container}>
      {/* Breadcrumb Section */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>Dashboard / Skillassessment</Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.assessmentBox}>
          <Text style={styles.assessmentTitle}>Skill Assessment for</Text>
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </View>

      {/* Modal for Level Selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Level</Text>
            
            {/* Level Selection Buttons */}
            <TouchableOpacity style={styles.levelButton}>
              <Text style={styles.levelButtonText}>ENTRY</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.levelButton}>
              <Text style={styles.levelButtonText}>BASIC</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.levelButton}>
              <Text style={styles.levelButtonText}>INTERMEDIATE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.levelButton}>
              <Text style={styles.levelButtonText}>ADVANCED</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  breadcrumb: {
    padding: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f1f1f1',
  },
  breadcrumbText: {
    fontSize: 12,
    color: '#6b7280',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assessmentBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '90%',
    alignItems: 'center',
  },
  assessmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#046c57',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#046c57',
    marginBottom: 20,
  },
  levelButton: {
    backgroundColor: '#046c57',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SkillAssessment;
