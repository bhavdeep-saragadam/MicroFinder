import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, FAB, Card, Surface } from 'react-native-paper';
import { Platform, Animated, StyleSheet, Dimensions, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const MENU_ITEMS = [
  { icon: 'home-variant', label: 'Home', route: '/(tabs)' },
  { icon: 'microscope', label: 'Analyze', route: '/(tabs)/camera' },
  { icon: 'bookshelf', label: 'Library', route: '/(tabs)/library' },
  { icon: 'account-circle', label: 'Profile', route: '/(tabs)/profile' },
];

export default function AppLayout() {
  const theme = useTheme();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnimation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isMenuOpen ? 0 : 1;
    setIsMenuOpen(!isMenuOpen);
    
    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
      friction: 6,
      tension: 65,
    }).start();
  };

  const menuTranslateY = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const menuOpacity = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const renderMenuItem = (item: typeof MENU_ITEMS[0]) => (
    <Pressable
      key={item.route}
      onPress={() => {
        toggleMenu();
        router.push(item.route);
      }}
      style={styles.menuItem}
    >
      <Surface style={styles.menuItemSurface} elevation={2}>
        <MaterialCommunityIcons name={item.icon as any} size={24} color={theme.colors.primary} />
        <Card.Title
          title={item.label}
          titleStyle={styles.menuItemText}
        />
      </Surface>
    </Pressable>
  );

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Stack 
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#fff',
            },
          }}
        />
        
        <FAB
          icon={isMenuOpen ? 'close' : 'menu'}
          style={styles.fab}
          onPress={toggleMenu}
          color={theme.colors.primary}
        />
        
        {isMenuOpen && (
          <Pressable style={styles.overlay} onPress={toggleMenu}>
            <Animated.View
              style={[
                styles.menuContainer,
                {
                  transform: [{ translateY: menuTranslateY }],
                  opacity: menuOpacity,
                },
              ]}
            >
              <Card style={styles.menuCard}>
                <Card.Content style={styles.menuContent}>
                  {MENU_ITEMS.map(renderMenuItem)}
                </Card.Content>
              </Card>
            </Animated.View>
          </Pressable>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 50,
  },
  menuContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 74,
    right: 16,
    width: Dimensions.get('window').width - 32,
    zIndex: 60,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
  menuContent: {
    paddingVertical: 8,
  },
  menuItem: {
    marginVertical: 4,
  },
  menuItemSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
  },
}); 