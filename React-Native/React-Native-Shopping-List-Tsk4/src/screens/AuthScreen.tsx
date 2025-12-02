// Login & Register Screen for React Native
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { APP_LOGO, COLORS } from '../constants';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signIn as signInAction, signUp as signUpAction } from '../store/slices/authSlice';
import type { SignInFormData, SignUpFormData } from '../types';

// Get screen dimensions for responsive design
Dimensions.get('window');

const AuthScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Sign Up form state
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    name: '',
    surname: '',
    email: '',
    cellNumber: '',
    password: '',
  });
  
  // Sign In form state
  const [signInData, setSignInData] = useState<SignInFormData>({
    email: '',
    password: '',
  });

  const handleSignUp = async () => {
    try {
      await dispatch(signUpAction(signUpData)).unwrap();
      setMessage({ type: 'success', text: 'Account created successfully!' });
      
      // Auto-fill login with registered email
      setSignInData(prev => ({ ...prev, email: signUpData.email }));
      // Clear sign up form
      setSignUpData({
        name: '',
        surname: '',
        email: '',
        cellNumber: '',
        password: '',
      });
      // Switch to login after a delay
      setTimeout(() => {
        setIsSignUp(false);
        setMessage(null);
      }, 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err as string || 'Failed to create account' });
    }
  };

  const handleSignIn = async () => {
    try {
      await dispatch(signInAction(signInData)).unwrap();
      setMessage({ type: 'success', text: 'Login successful!' });
      setTimeout(() => {
        router.replace('/(tabs)/dashboard');
      }, 500);
    } catch (err) {
      setMessage({ type: 'error', text: err as string || 'Login failed' });
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setMessage(null);
  };

  return (
    <LinearGradient
      colors={[COLORS.primaryDark, COLORS.primary, COLORS.primaryLight]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image source={APP_LOGO} style={styles.logo} resizeMode="contain" />
            <Text style={styles.appName}>Shopping List</Text>
            <Text style={styles.tagline}>Organize your shopping effortlessly</Text>
          </View>

          {/* Message */}
          {message && (
            <View style={[
              styles.messageContainer,
              message.type === 'success' ? styles.successMessage : styles.errorMessage
            ]}>
              <Ionicons 
                name={message.type === 'success' ? 'checkmark-circle' : 'alert-circle'} 
                size={20} 
                color={message.type === 'success' ? COLORS.success : COLORS.error} 
              />
              <Text style={[
                styles.messageText,
                { color: message.type === 'success' ? COLORS.success : COLORS.error }
              ]}>
                {message.text}
              </Text>
            </View>
          )}

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {isSignUp ? 'Create Account' : 'Welcome Back!'}
            </Text>
            <Text style={styles.formSubtitle}>
              {isSignUp 
                ? 'Sign up to start organizing your shopping' 
                : 'Sign in to continue to your shopping list'}
            </Text>

            {isSignUp ? (
              // Sign Up Form
              <>
                <View style={styles.row}>
                  <View style={[styles.inputContainer, styles.halfInput]}>
                    <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="First Name"
                      placeholderTextColor={COLORS.textSecondary}
                      value={signUpData.name}
                      onChangeText={(text) => setSignUpData(prev => ({ ...prev, name: text }))}
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={[styles.inputContainer, styles.halfInput]}>
                    <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Surname"
                      placeholderTextColor={COLORS.textSecondary}
                      value={signUpData.surname}
                      onChangeText={(text) => setSignUpData(prev => ({ ...prev, surname: text }))}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor={COLORS.textSecondary}
                    value={signUpData.email}
                    onChangeText={(text) => setSignUpData(prev => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Cell Number"
                    placeholderTextColor={COLORS.textSecondary}
                    value={signUpData.cellNumber}
                    onChangeText={(text) => setSignUpData(prev => ({ ...prev, cellNumber: text }))}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={COLORS.textSecondary}
                    value={signUpData.password}
                    onChangeText={(text) => setSignUpData(prev => ({ ...prev, password: text }))}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color={COLORS.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSignUp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Sign Up</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              // Sign In Form
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor={COLORS.textSecondary}
                    value={signInData.email}
                    onChangeText={(text) => setSignInData(prev => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={COLORS.textSecondary}
                    value={signInData.password}
                    onChangeText={(text) => setSignInData(prev => ({ ...prev, password: text }))}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color={COLORS.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSignIn}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Toggle Mode */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <TouchableOpacity onPress={toggleMode}>
                <Text style={styles.toggleLink}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successMessage: {
    backgroundColor: COLORS.successLight,
  },
  errorMessage: {
    backgroundColor: COLORS.errorLight,
  },
  messageText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  halfInput: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 12,
    marginLeft: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  toggleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  toggleLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default AuthScreen;
