import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggleContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
  },
  fadeButtonWrapper: {
    width: '100%',
    marginTop: 14,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonCentered: {
    alignSelf: 'center',
  },
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#F97316',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 7,
    textAlign: 'center',
  },

  featuresGrid: {
    marginTop: 40,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  featureCard: {
    width: 380,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    marginBottom: 20,
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(0,255,204,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,255,204,0.3)',
  },

  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },

  featureDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.80)',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
});
