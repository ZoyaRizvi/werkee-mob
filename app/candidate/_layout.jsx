import { Image, Text, View } from "react-native";
import { Tabs } from "expo-router";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer"; // Import Drawer components
import { LinearGradient } from 'expo-linear-gradient'; // For gradient background
import { icons } from "../../constants";
import Councellor from "../screens/councellor";
import SkillAssessmentScreen from "../screens/SkillAssessmentScreen3";
import chat from "../screens/chat";
import logo from "../../assets/images/werkee.jpg"
import COrders from "../screens/COrders"

// Drawer Navigator
const Drawer = createDrawerNavigator();

// Custom Drawer Content (for custom styling)
const CustomDrawerContent = (props) => {
  return (
    <LinearGradient
    colors={['#0a9ea6', '#4DB6AC']} // Gradient background
      style={{ flex: 1 }}
    >
      <DrawerContentScrollView {...props}>
        {/* Header Section (Optional Profile Picture, etc.) */}
        <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
          <Image
            source={logo} // Add your logo or profile image
            style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }}
          />
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>
            Welcome, User!
          </Text>
        </View>
        <DrawerItemList {...props} />
        
      </DrawerContentScrollView>
    </LinearGradient>
  );
};

// Tab Icon Component
const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="flex items-center justify-center gap-2">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6"
      />
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

// Tabs Component
const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3dacae",
        tabBarInactiveTintColor: "#CDCDE0",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#545454",
          borderTopWidth: 1,
          borderTopColor: "#232533",
          height: 84,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.home}
              color={color}
              name="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.chat}
              color={color}
              name="Create"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.profile}
              color={color}
              name="Profile"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
};

// Drawer Layout with custom styles
const DrawerLayout = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />} // Use custom drawer content
      screenOptions={{
        drawerStyle: {
          backgroundColor: "transparent", // Let the gradient show
          width: 240,
        },
        drawerActiveTintColor: "#FFF", // Text color for active item
        drawerInactiveTintColor: "#E0E0E0", // Text color for inactive items
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
        drawerItemStyle: {
          marginVertical: 5,
          paddingHorizontal: 10,
        },
        drawerActiveBackgroundColor: "#6200EA", // Background color for active item
        drawerInactiveBackgroundColor: "transparent", // Transparent for inactive items
      }}
    >
      {/* Drawer Screens */}
      <Drawer.Screen name="Tabs" component={TabsLayout} options={{ title: "Home" }} />
      <Drawer.Screen name="Councellor" component={Councellor} options={{ title: "Councellor" }} />
      <Drawer.Screen name="SkillAssessment" component={SkillAssessmentScreen} options={{ title: "SkillAssessment" }} />
      <Drawer.Screen name="Chat" component={chat} options={{ title: "Chat" }} />
      <Drawer.Screen name="Orders" component={COrders} options={{ title: "Orders" }} />
    </Drawer.Navigator>
  );
};


export default DrawerLayout;


