// app/index.jsx
import { useEffect } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS } from '../constants/colors';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Simulate loading delay for better UX (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if user has auth token
        const authToken = await SecureStore.getItemAsync('authToken');

        if (authToken) {
          // User is authenticated, go to home
          router.replace('/(root)/');
        } else {
          // No auth token, go to login
          router.replace('/(auth)/sign-in');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // If error, go to login as a fallback
        router.replace('/(auth)/sign-in');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
      }}
    >
      <Image
        source={require('../assets/images/playstore.png')}
        style={{
          width: 200,
          height: 200,
          marginBottom: 30,
        }}
        resizeMode="contain"
      />
      
    </View>
  );
}
