import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Image,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Avatar, Button, Card, Title, Paragraph, IconButton, Chip } from 'react-native-paper';
import { collectionGroup, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import CustomButton from '../../components/CustomButton';

export function Home() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const itemsPerPage = 6;

  const fetchPost = async () => {
    try {
      const querySnapshot = await getDocs(collectionGroup(db, "jobs"));
      const newData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setJobs(newData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching jobs: ", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchPost();
  }, []);

  const handleInputChange = (text) => {
    setQuery(text);
  };

  const calculatePageRange = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return { startIndex, endIndex };
  };

  const filteredData = (jobs, selectedCategory, selectedDate, query) => {
    let filteredJobs = jobs;

    if (query) {
      filteredJobs = filteredJobs.filter((job) =>
        (job.title || "").toLowerCase().includes(query.toLowerCase())
      );
    }

    if (selectedCategory) {
      filteredJobs = filteredJobs.filter((job) =>
        job.jobLocation && job.jobLocation.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      filteredJobs = filteredJobs.filter((job) => {
        const jobPostingDate = new Date(job.postedDate);
        return jobPostingDate >= selectedDateObj;
      });
    }

    const { startIndex, endIndex } = calculatePageRange();
    filteredJobs = filteredJobs.slice(startIndex, endIndex);

    return filteredJobs.map((data, i) => <CardCustom key={i} data={data} />);
  };

  const result = filteredData(jobs, selectedCategory, selectedDate, query);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Find your <Text style={{ color: '#51834f' }}>new job</Text> today
          </Text>
          <Text style={styles.bannerSubText}>
            Endless opportunities are just around the corner—dive in and grab yours.
          </Text>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="What jobs are you looking for?"
              placeholderTextColor="#999"
              value={query}
              onChangeText={handleInputChange}
            />
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#51834f" />
        ) : (
          <View style={styles.card}>
            {result}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const CardCustom = ({ data }) => {
  return (
    <View style={styles.jobItem}>
      <Image source={{ uri: data.imageUrl }} style={styles.jobImage} />
      <View style={styles.jobDetailsContainer}>
        <Text style={styles.jobTitle}>{data.title}</Text>
        <Text style={styles.jobCompany}>{data.company}</Text>
        <Text style={styles.jobExtraDetails}>Requirements: {data.requirements}</Text>
        <Text style={styles.jobExtraDetails}>Location: {data.location}</Text>
        <Text style={styles.jobExtraDetails}>Contract Type: {data.contractType}</Text>
        <Text style={styles.jobExtraDetails}>Posted on: {data.postedDate}</Text>
        <Text style={styles.jobDescription}>{data.description}</Text>
        {/* Apply Button */}
        <CustomButton
          title="Apply"
          handlePress={() => alert(`Applying for ${data.title}`)}
          containerStyles={styles.applyButtonContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop:0,
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 4,
    zIndex: 1,
  },
  menuIcon: {
    flex: 0.2,
  },
  profileIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.6,
    justifyContent: 'center',
  },
  profileName: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    flex: 0.2,
    justifyContent: 'flex-end',
  },
  banner: {
    backgroundColor: '#FFF2E1',
    padding: 0,
    borderRadius: 8,
    marginTop:20,
    marginBottom: 16,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  bannerSubText: {
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 32,
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
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
    borderRadius: 30,
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
    color: '#4a5568',
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#009B81',
    borderRadius: 8,
  },
});

export default Home;
