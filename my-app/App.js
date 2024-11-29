import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import { signOut } from 'firebase/auth';

// Import screens
import WelcomeScreen from './screens/Client/Welcome';
import LoginScreen from './screens/Auth/Login';
import RegisterScreen from './screens/Auth/Register';
import HomeClientScreen from './screens/Client/HomeClient';
import ProfileScreen from './screens/Shared/Profile';
import RewardsScreen from './screens/Client/Rewards';
import AddScreen from './screens/Client/Add';
import AgendaScreen from './screens/Shared/Agenda';
import AdminDashboardScreen from './screens/Admin/AdminDashboard';
import UserManagementScreen from './screens/Admin/UserManagement';
import HomeDoctorScreen from './screens/Doctor/HomeDoctor';
import CreateDoctorScreen from './screens/Admin/CreateDoctor';
import AppointmentDetailsScreen from './screens/Shared/AppointmentDetails';
import LoadingScreen from './components/LoadingScreen';
import ServiceManagementScreen from './screens/Admin/ServiceManagement';
import CreateServiceScreen from './screens/Admin/CreateService';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          console.log('User logged in:', user.uid);
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User role:', userData.role);
            setUserRole(userData?.role || null);
          } else {
            setUserRole(null);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
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
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Error signing out:', error.message);
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

  const AdminTabs = () => (
    <Tab.Navigator>
       <Tab.Screen
        name="CreateDoctor"
        component={CreateDoctorScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="users" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Dashboard"
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="dashboard" color={color} size={size} />,
        }}
      >
        {(props) => <AdminDashboardScreen {...props} handleLogout={handleLogout} />}
      </Tab.Screen>
      <Tab.Screen
        name="ServiceManagement"
        component={ServiceManagementScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="cogs" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="CreateService"
        component={CreateServiceScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      
     
    </Tab.Navigator>
  );
  
  const RoleBasedNavigator = () => {
    if (isLoading) {
      return <LoadingScreen />;
    } else if (userRole === 'client') {
      return <ClientTabs />;
    } else if (userRole === 'doctor') {
      return <DoctorTabs />;
    } else if (userRole === 'admin') {
      return <AdminTabs />;
    } else {
      return <WelcomeScreen />;
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
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
                <Stack.Screen name="Login" options={{ headerShown: false }}>
                  {(props) => <LoginScreen {...props} onLoginSuccess={(role) => setUserRole(role)} />}
                </Stack.Screen>
                <Stack.Screen
                  name="Register"
                  component={RegisterScreen}
                  options={{ headerShown: false }}
                />
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
  );
}
