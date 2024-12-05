import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';


// Import screens
import WelcomeScreen from './screens/Auth/Welcome';
import HomeClientScreen from './screens/Client/HomeClient';
import ProfileScreen from './screens/Shared/Profile';
import RewardsScreen from './screens/Client/Rewards';
import AddScreen from './screens/Client/BookAppointment/Add';
import AgendaScreen from './screens/Shared/Agenda';
import AdminDashboardScreen from './screens/Admin/AdminDashboard';
import UserManagementScreen from './screens/Admin/Users/UserManagement';
import HomeDoctorScreen from './screens/Doctor/HomeDoctor';
import CreateDoctorScreen from './screens/Admin/Users/CreateDoctor';
import EditDoctorScreen from './screens/Admin/Users/EditDoctor';
import AppointmentDetailsScreen from './screens/Shared/AppointmentDetails';
import LoadingScreen from './components/LoadingScreen';
import ServiceManagementScreen from './screens/Admin/Services/ServiceManagement';
import CreateServiceScreen from './screens/Admin/Services/CreateService';
import CreateSpecialityScreen from './screens/Admin/Services/CreateSpecialty';

import NameScreen from './screens/Auth/Register/NameScreen';
import EmailScreen from './screens/Auth/Register/EmailScreen';
import PasswordScreen from './screens/Auth/Register/PasswordScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log('User logged in:', user.uid);
  
        // Only fetch the logged-in user's role
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User role from Firestore:', userData?.role);
          setUserRole(userData?.role || null);  // Set role if exists
        } else {
          setUserRole(null); // If no user document, reset role
        }
      } else {
        setUserRole(null);
      }
      setIsLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  
  const handleLogout = async (navigation) => {
    try {
      await signOut(auth);
      setUserRole(null);
      navigation.reset({
        index: 0,
        routes: [{ name: navigation.getState()?.routes[0]?.name || 'Welcome' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  

  
  const ClientTabs = () => (
    <Tab.Navigator>
      <Tab.Screen
        name="HomeClient"
        component={HomeClientScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="calendar" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="plus-circle" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="gift" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="user" color={color} size={size} />,
        }}
      >
        {(props) => <ProfileScreen {...props} handleLogout={handleLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );

  const DoctorTabs = () => (
    <Tab.Navigator>
      <Tab.Screen
        name="HomeDoctor"
        component={HomeDoctorScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="stethoscope" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="calendar" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="user" color={color} size={size} />,
        }}
      >
        {(props) => <ProfileScreen {...props} handleLogout={handleLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );

  const AdminServiceStack = createStackNavigator();

  const AdminServiceStackNavigator = () => (
    <AdminServiceStack.Navigator>
      <AdminServiceStack.Screen 
        name="ServiceManagement" 
        component={ServiceManagementScreen} 
        options={{ title: "Service Management" }} 
      />
      <AdminServiceStack.Screen 
        name="CreateService" 
        component={CreateServiceScreen} 
        options={{ title: "Create Service" }} 
      />
      <AdminServiceStack.Screen 
        name="CreateSpecialty" 
        component={CreateSpecialityScreen} 
        options={{ title: "Create Specialty" }} 
      />
    </AdminServiceStack.Navigator>
  );

  const AdminUserManagementStack = createStackNavigator();

  const AdminUserManagementStackNavigator = () => (
    <AdminUserManagementStack.Navigator>
      <AdminUserManagementStack.Screen 
        name="UserManagement" 
        component={UserManagementScreen} 
        options={{ title: "User Management" }} 
      />
      <AdminUserManagementStack.Screen 
        name="CreateDoctor" 
        component={CreateDoctorScreen} 
        options={{ title: "Create Doctor" }} 
      />
      <AdminUserManagementStack.Screen 
        name="EditDoctor" 
        component={EditDoctorScreen} 
        options={{ title: "Edit Doctor" }} 
      />
    </AdminUserManagementStack.Navigator>
  );

  const AdminTabs = () => (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          display: 'flex', // Ensures the tab bar is always visible
        },
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
        }}
      >
        {(props) => <AdminDashboardScreen {...props} handleLogout={handleLogout} />}
      </Tab.Screen>
  
      <Tab.Screen
        name="UserManagementTab"
        component={AdminUserManagementStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="users" color={color} size={size} />,
          title: "Users",
        }}
      />
  
      <Tab.Screen
        name="ServiceManagementTab"
        component={AdminServiceStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="cogs" color={color} size={size} />,
          title: "Services",
        }}
      />
    </Tab.Navigator>
  );

  const RoleBasedNavigator = () => {
    if (isLoading) return <LoadingScreen />;
    if (userRole === 'client') return <ClientTabs />;
    if (userRole === 'doctor') return <DoctorTabs />;
    if (userRole === 'admin') return <AdminTabs />;
    return <WelcomeScreen />;
  };

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={({ navigation }) => ({
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-left" size={20} color="#000" />
              </TouchableOpacity>
            ),
          })}
        >
          {isLoading ? (
            <Stack.Screen
              name="LoadingScreen"
              component={LoadingScreen}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              {!userRole ? (
                <>
                  <Stack.Screen
                    name="Welcome"
                    component={WelcomeScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="Email" component={EmailScreen} />
                  <Stack.Screen name="Name" component={NameScreen} />
                  <Stack.Screen name="Password" component={PasswordScreen} />
                </>
              ) : (
                <Stack.Screen
                  name="RoleBasedNavigator"
                  component={RoleBasedNavigator}
                  options={{ headerShown: false }}
                />
              )}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Set background color to white
  },
});
