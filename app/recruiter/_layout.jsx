import { Image, Text, View } from "react-native";
import { Tabs } from "expo-router";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer"; 
import { LinearGradient } from 'expo-linear-gradient'; 
import { icons } from "../../constants";
import ROrders from "../screens/Rorders";
import logo from "../../assets/images/werkee.jpg"
import Profile from "./profile";
import { LogOut } from '../(auth)/logout'; 
import Councellor from "../screens/councellor";


const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  return (
    <LinearGradient
    colors={['#0a9ea6', '#4DB6AC']}
      style={{ flex: 1 }}
    >
      <DrawerContentScrollView {...props}>
        <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
          <Image
            source={logo} 
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
              name="Chat"
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

const DrawerLayout = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />} 
      screenOptions={{
        drawerStyle: {
          backgroundColor: "transparent", 
          width: 240,
        },
        drawerActiveTintColor: "#FFF", 
        drawerInactiveTintColor: "#E0E0E0",
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
        drawerItemStyle: {
          marginVertical: 5,
          paddingHorizontal: 10,
        },
        drawerActiveBackgroundColor: "#6200EA", 
        drawerInactiveBackgroundColor: "transparent", 
      }}
    >
      <Drawer.Screen name="Tabs" component={TabsLayout} options={{ title: "Home" }} />
      <Drawer.Screen name="Profile" component={Profile} options={{ title: "Profile" }} />
      <Drawer.Screen name="Councellor" component={Councellor} options={{ title: "Councellor" }} />
      <Drawer.Screen name="LogOut" component={LogOut} options={{ title: "Log Out" }} />
      <Drawer.Screen name="orders" component={ROrders} options={{ title: "Orders" }} />
    </Drawer.Navigator>
  );
};


export default DrawerLayout;