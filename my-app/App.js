import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore'; // Ensure you import Firebase Firestore functions
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icons

// Import Screens
import WelcomeScreen from './screens/Client/Welcome';
import LoginScreen from './screens/Auth/Login';
import RegisterScreen from './screens/Auth/Register';
import HomeClientScreen from './screens/Client/HomeClient';
import ProfileScreen from './screens/Client/Profile';
import RewardsScreen from './screens/Client/Rewards';
import AddScreen from './screens/Client/Add';
import AgendaScreen from './screens/Client/Agenda';
import AdminDashboardScreen from './screens/Admin/AdminDashboard';
import UserManagementScreen from './screens/Admin/UserManagement';
import HomeDoctorScreen from './screens/Doctor/HomeDoctor';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('auth.onAuthStateChanged called');
      if (user) {
        console.log('User logged in:', user.uid);
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData?.role || null);
            console.log('User role:', userData?.role);
          } else {
            console.log('No user data found in Firestore.');
            setUserRole(null);
          }
        } catch (error) {
          console.log('Error fetching user role:', error);
          setUserRole(null);
        }
      } else {
        console.log('No user logged in');
        setUserRole(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (role, navigation) => {
    setUserRole(role);
    console.log('Role set on app:', role);
    navigation.replace('RoleBasedNavigator');  // Replace the login screen with the role-based navigator
  };

  const RoleBasedNavigator = () => {
    console.log('Rendering RoleBasedNavigator for role:', userRole);
    if (userRole === 'client') {
      return (
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
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="user" color={color} size={size} />,
          }}
          />
        </Tab.Navigator>
      );
    } else if (userRole === 'doctor') {
      return (
        <Tab.Navigator>
          <Tab.Screen
            name="HomeDoctor"
            component={HomeDoctorScreen}
            options={{
              tabBarIcon: ({ color, size }) => <Icon name="stethoscope" color={color} size={size} />,
            }}
          />
        </Tab.Navigator>
      );
    } else if (userRole === 'admin') {
      return (
        <Stack.Navigator>
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="UserManagement" component={UserManagementScreen} />
        </Stack.Navigator>
      );
    }
    return null;
  };

  // Render loading screen while role is being determined
  if (isLoading) {
    return <WelcomeScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" options={{ headerShown: false }}>
          {(props) => <LoginScreen {...props} onLoginSuccess={(role) => handleLoginSuccess(role, props.navigation)} />}
        </Stack.Screen>
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />

        {/* Render RoleBasedNavigator directly after role is set */}
        <Stack.Screen
          name="RoleBasedNavigator"
          component={RoleBasedNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
