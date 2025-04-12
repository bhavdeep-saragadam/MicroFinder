import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Avatar, Button, List, Divider, useTheme } from 'react-native-paper';
import { useRouter, Redirect } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [profile, setProfile] = useState({
    username: '',
    fullName: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session) {
        fetchProfile();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthenticated(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create one
          const newProfile = {
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            full_name: user.user_metadata?.full_name || 'New User',
          };
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([newProfile]);
            
          if (!insertError) {
            setProfile({
              username: newProfile.username,
              fullName: newProfile.full_name,
              email: user.email || '',
            });
          }
        } else {
          console.error('Error fetching profile:', error);
        }
      } else if (data) {
        setProfile({
          username: data.username || 'Not set',
          fullName: data.full_name || 'Not set',
          email: user.email || 'Not set',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setIsAuthenticated(false);
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  if (isLoading || isAuthenticated === null) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Avatar.Icon 
            size={80} 
            icon="account"
            style={styles.avatar}
            color={theme.colors.primary}
          />
          <Text variant="headlineSmall" style={styles.name}>{profile.fullName}</Text>
          <Text variant="bodyLarge" style={styles.username}>@{profile.username}</Text>
        </View>

        <List.Section>
          <List.Subheader>Account Information</List.Subheader>
          <List.Item
            title="Email"
            description={profile.email}
            left={props => <List.Icon {...props} icon="email" color={theme.colors.primary} />}
          />
          <Divider />
          <List.Item
            title="Edit Profile"
            left={props => <List.Icon {...props} icon="account-edit" color={theme.colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/(tabs)/profile/edit')}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>App Settings</List.Subheader>
          <List.Item
            title="Notifications"
            left={props => <List.Icon {...props} icon="bell" color={theme.colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/(tabs)/profile/notifications')}
          />
          <Divider />
          <List.Item
            title="Privacy & Security"
            left={props => <List.Icon {...props} icon="shield-lock" color={theme.colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/(tabs)/profile/privacy')}
          />
          <Divider />
          <List.Item
            title="Help & Support"
            left={props => <List.Icon {...props} icon="help-circle" color={theme.colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/(tabs)/profile/support')}
          />
        </List.Section>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            contentStyle={styles.logoutButtonContent}
          >
            Sign Out
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  name: {
    fontWeight: '600',
    marginBottom: 4,
  },
  username: {
    opacity: 0.7,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    borderRadius: 8,
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
}); 