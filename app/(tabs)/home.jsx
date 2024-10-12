import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { ArrowUpIcon } from 'react-native-heroicons/outline';
import CustomButton from "../../components/CustomButton";
import FormField from "../../components/FormField";

const jobsMockData = [
  {
    id: 1,
    title: "Software Engineer",
    company: "Amazon",
    requirements: "Selenium",
    location: "Karachi",
    contractType: "Contract",
    postingDate: "8/3/2024",
    imageUrl: 'https://via.placeholder.com/60',
    description: "This project involved creating a comprehensive branding and visual identity package for Amazon. The goal was to develop a modern, cohesive, and visually striking brand identity that resonates with the target audience and stands out in the competitive market.",
  },
  {
    id: 2,
    title: "Product Manager",
    company: "Amazon",
    requirements: "Selenium",
    location: "Karachi",
    contractType: "Contract",
    postingDate: "8/3/2024",
    imageUrl: 'https://via.placeholder.com/60',
    description: "This project involved creating a comprehensive branding and visual identity package for Amazon. The goal was to develop a modern, cohesive, and visually striking brand identity that resonates with the target audience and stands out in the competitive market.",
  },
  {
    id: 3,
    title: "Data Scientist",
    company: "Amazon",
    requirements: "Selenium",
    location: "Karachi",
    contractType: "Contract",
    postingDate: "8/3/2024",
    imageUrl: 'https://via.placeholder.com/60',
    description: "This project involved creating a comprehensive branding and visual identity package for Amazon. The goal was to develop a modern, cohesive, and visually striking brand identity that resonates with the target audience and stands out in the competitive market.",
  },
  {
    id: 4,
    title: "Data Analyst",
    company: "Amazon",
    requirements: "Selenium",
    location: "Karachi",
    contractType: "Contract",
    postingDate: "8/3/2024",
    imageUrl: 'https://via.placeholder.com/60',
    description: "This project involved creating a comprehensive branding and visual identity package for Amazon. The goal was to develop a modern, cohesive, and visually striking brand identity that resonates with the target audience and stands out in the competitive market.",
  },
];

const Home = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Banner Section */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Welcome to the Job Portal</Text>
        </View>

        {/* Job Listings Section */}
        <View style={styles.card}>
          {jobsMockData.map((job) => (
            <View key={job.id} style={styles.jobItem}>
              <Image source={{ uri: job.imageUrl }} style={styles.jobImage} />
              <View style={styles.jobDetailsContainer}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobCompany}>{job.company}</Text>
                {job.requirements && (
                  <Text style={styles.jobExtraDetails}>
                    Requirements: {job.requirements}
                  </Text>
                )}
                {job.location && (
                  <Text style={styles.jobExtraDetails}>
                    Location: {job.location}
                  </Text>
                )}
                {job.contractType && (
                  <Text style={styles.jobExtraDetails}>
                    Contract Type: {job.contractType}
                  </Text>
                )}
                <Text style={styles.jobExtraDetails}>
                  Posted on: {job.postingDate} | Max Salary: ${job.maxPrice}
                </Text>
                <Text style={styles.jobDescription}>
                  {job.description}
                </Text>
                {/* Apply Button */}
                <CustomButton
                  title="Apply"
                  handlePress={() => alert(`Applying for ${job.title}`)}
                  isLoading={false} // You can manage loading state here
                  containerStyles={styles.applyButtonContainer}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Example Form Field */}
        <FormField
          title="Email"
          value=""
          placeholder="Enter your email"
          handleChangeText={() => {}}
          otherStyles={styles.formField}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  banner: {
    backgroundColor: '#FFF2E1', // Change banner color as needed
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000', // White text color
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  jobItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 8,
  },
  jobImage: {
    width: 60,
    height: 60,
    borderRadius: 30, // Circular image
    marginRight: 16,
  },
  jobDetailsContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  jobCompany: {
    fontSize: 14,
    color: '#4a5568', // Dark gray for company name
    marginBottom: 4,
  },
  jobExtraDetails: {
    fontSize: 12,
    color: '#718096',
  },
  jobDescription: {
    fontSize: 12,
    color: '#4a5568',
    marginVertical: 4,
  },
  applyButtonContainer: {
    marginTop: 10,
  },
  formField: {
    marginTop: 16,
  },
});

export default Home;