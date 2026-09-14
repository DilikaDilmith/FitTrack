import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Platform,
  Alert as NativeAlert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// Global listener registry for static calls
let activeAlertListener = null;

// ============================================
// 🎯 ALERT HELPER & TYPE DETECTOR
// ============================================
const detectAlertType = (title = '', message = '', buttons = []) => {
  const text = `${title} ${message}`.toLowerCase();

  if (/clear all/i.test(text)) {
    return 'clear';
  }

  if (/logout/i.test(text)) {
    return 'logout';
  }

  // Check buttons for destructive flag or delete keywords
  const hasDestructive = (Array.isArray(buttons) ? buttons : []).some(
    (b) => b && (b.style === 'destructive' || (b.text && /delete|remove|clear|reset|logout/i.test(b.text)))
  );

  if (hasDestructive || /delete|remove|reset/i.test(text)) {
    return 'confirm';
  }

  if (/schedule/i.test(text)) {
    return 'schedule';
  }

  if (/error|failed|invalid|cannot|wrong|must be|please enter|required/i.test(text)) {
    return 'error';
  }

  if (
    /success|added|created|saved|updated|congrat|achieved|hero|conquered/i.test(text) ||
    title.includes('✅') ||
    title.includes('🎉') ||
    title.includes('💪') ||
    title.includes('▶️')
  ) {
    if (text.includes('hydration') || text.includes('water') || text.includes('drink') || text.includes('ml')) {
      return 'water';
    }
    return 'success';
  }

  if (/warning|note|caution|careful/i.test(text) || title.includes('⚠️')) {
    return 'warning';
  }

  if (text.includes('hydration') || text.includes('water') || text.includes('ml')) {
    return 'water';
  }

  return 'info';
};

// Clean emojis from titles for clean rendering alongside icon badge
const cleanTitle = (title = '') => {
  return title.replace(/^[✅🎉⚠️💪▶️🔥💡❌🚨📅🗑️💧\s]+/, '').trim() || title;
};

// ============================================
// 🎨 BADGE & GRADIENT CONFIGS
// ============================================
const getThemeTypeConfig = (type, theme, isDark) => {
  switch (type) {
    case 'success':
      return {
        icon: 'checkmark-circle',
        gradient: ['#00E676', '#00C853'],
        glowColor: 'rgba(0, 230, 118, 0.35)',
        buttonGradient: ['#00E676', '#00B04A'],
        tagText: 'SUCCESS',
        accentColor: '#00C853',
      };
    case 'schedule':
      return {
        icon: 'calendar',
        gradient: ['#4A9EFF', '#2E86DE'],
        glowColor: 'rgba(74, 158, 255, 0.35)',
        buttonGradient: ['#4A9EFF', '#2E86DE'],
        tagText: 'SCHEDULED',
        accentColor: '#2E86DE',
      };
    case 'clear':
      return {
        icon: 'trash-bin',
        gradient: ['#FF5252', '#D32F2F'],
        glowColor: 'rgba(255, 82, 82, 0.35)',
        buttonGradient: ['#FF5252', '#D32F2F'],
        tagText: 'CLEAR ALL',
        accentColor: '#FF5252',
      };
    case 'logout':
      return {
        icon: 'log-out',
        gradient: ['#FF7043', '#E64A19'],
        glowColor: 'rgba(255, 112, 67, 0.35)',
        buttonGradient: ['#FF5252', '#D32F2F'],
        tagText: 'LOGOUT',
        accentColor: '#E64A19',
      };
    case 'error':
      return {
        icon: 'alert-circle',
        gradient: ['#FF5252', '#E53935'],
        glowColor: 'rgba(255, 82, 82, 0.35)',
        buttonGradient: ['#FF5252', '#D32F2F'],
        tagText: 'ALERT',
        accentColor: '#FF5252',
      };
    case 'warning':
      return {
        icon: 'warning',
        gradient: ['#FFD54F', '#FFA000'],
        glowColor: 'rgba(255, 193, 7, 0.35)',
        buttonGradient: ['#FFB300', '#F57C00'],
        tagText: 'NOTICE',
        accentColor: '#FFB300',
      };
    case 'confirm':
      return {
        icon: 'trash',
        gradient: ['#FF6B6B', '#EE5253'],
        glowColor: 'rgba(238, 82, 83, 0.35)',
        buttonGradient: ['#FF5252', '#D32F2F'],
        tagText: 'CONFIRM DELETE',
        accentColor: '#FF5252',
      };
    case 'water':
      return {
        icon: 'water',
        gradient: ['#00E5FF', '#00B4D8'],
        glowColor: 'rgba(0, 229, 255, 0.35)',
        buttonGradient: ['#00D2FF', '#0083B0'],
        tagText: 'HYDRATION',
        accentColor: '#00B4D8',
      };
    case 'info':
    default:
      return {
        icon: 'information-circle',
        gradient: theme.primaryGradient || ['#4A9EFF', '#2E86DE'],
        glowColor: 'rgba(74, 158, 255, 0.35)',
        buttonGradient: theme.primaryGradient || ['#4A9EFF', '#2E86DE'],
        tagText: 'FITTRACK',
        accentColor: theme.primary || '#2E86DE',
      };
  }
};

// ============================================
// 🔔 MAIN FIT ALERT COMPONENT
// ============================================
export const FitAlert = () => {
  const { theme, isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    buttons: [],
    cancelable: true,
    customIcon: null,
  });

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const dismiss = useCallback(
    (callback) => {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.88,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
        if (typeof callback === 'function') {
          setTimeout(callback, 50);
        }
      });
    },
    [opacityAnim, scaleAnim]
  );

  const show = useCallback(
    (alertConfig) => {
      const {
        title = '',
        message = '',
        buttons = [],
        type,
        cancelable = true,
        customIcon = null,
      } = alertConfig;

      const resolvedType = type || detectAlertType(title, message, buttons);

      // Normalise buttons
      let resolvedButtons = buttons;
      if (!buttons || buttons.length === 0) {
        resolvedButtons = [{ text: 'Got it', style: 'default' }];
      }

      setConfig({
        title,
        message,
        type: resolvedType,
        buttons: resolvedButtons,
        cancelable,
        customIcon,
      });

      setVisible(true);

      // Reset & Animate entrance
      scaleAnim.setValue(0.82);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [opacityAnim, scaleAnim]
  );

  // Register listener for static calls
  useEffect(() => {
    activeAlertListener = show;
    return () => {
      activeAlertListener = null;
    };
  }, [show]);

  if (!visible) return null;

  const typeConfig = getThemeTypeConfig(config.type, theme, isDark);
  const displayTitle = cleanTitle(config.title);
  const isMultipleButtons = config.buttons.length > 2;
  const isTwoButtons = config.buttons.length === 2;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        if (config.cancelable) dismiss();
      }}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          if (config.cancelable) dismiss();
        }}
      >
        <Animated.View
          style={[
            styles.overlay,
            {
              backgroundColor: isDark
                ? 'rgba(7, 10, 15, 0.82)'
                : 'rgba(15, 23, 42, 0.65)',
              opacity: opacityAnim,
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View
              style={[
                styles.modalCard,
                {
                  backgroundColor: isDark ? '#161B26' : '#FFFFFF',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(0, 0, 0, 0.08)',
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                  shadowColor: isDark ? typeConfig.glowColor : '#000000',
                  shadowOpacity: isDark ? 0.35 : 0.15,
                  shadowRadius: 18,
                  elevation: 12,
                },
              ]}
            >
              {/* Floating Glowing Badge */}
              <View style={styles.badgeWrapper}>
                <View
                  style={[
                    styles.badgeGlow,
                    { backgroundColor: typeConfig.glowColor },
                  ]}
                />
                <LinearGradient
                  colors={typeConfig.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.badgeGradient}
                >
                  <Ionicons
                    name={config.customIcon || typeConfig.icon}
                    size={32}
                    color="#FFFFFF"
                  />
                </LinearGradient>
              </View>

              {/* Tag / Category Indicator */}
              <View
                style={[
                  styles.tagPill,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(0, 0, 0, 0.04)',
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}
              >
                <View
                  style={[
                    styles.tagDot,
                    { backgroundColor: typeConfig.accentColor },
                  ]}
                />
                <Text
                  style={[
                    styles.tagText,
                    { color: typeConfig.accentColor },
                  ]}
                >
                  {typeConfig.tagText}
                </Text>
              </View>

              {/* Title */}
              {Boolean(displayTitle) && (
                <Text
                  style={[
                    styles.title,
                    { color: isDark ? '#F1F5F9' : '#0F172A' },
                  ]}
                  numberOfLines={2}
                >
                  {displayTitle}
                </Text>
              )}

              {/* Message */}
              {Boolean(config.message) && (
                <Text
                  style={[
                    styles.message,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}
                >
                  {config.message}
                </Text>
              )}

              {/* Buttons Container */}
              <View
                style={[
                  styles.buttonContainer,
                  isTwoButtons && styles.twoButtonsRow,
                  isMultipleButtons && styles.multipleButtonsColumn,
                ]}
              >
                {config.buttons.map((btn, index) => {
                  const isDestructive =
                    btn.style === 'destructive' ||
                    /delete|remove|clear|reset|logout/i.test(btn.text || '');
                  const isCancel = btn.style === 'cancel' || /cancel|close|back/i.test(btn.text || '');
                  const isPrimary = !isCancel && !isDestructive;

                  let btnGradient = typeConfig.buttonGradient;
                  if (isDestructive) {
                    btnGradient = ['#FF5252', '#D32F2F'];
                  } else if (isPrimary && (config.type === 'confirm' || config.type === 'clear')) {
                    btnGradient = theme.primaryGradient || ['#4A9EFF', '#2E86DE'];
                  }

                  if (isCancel) {
                    return (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={0.7}
                        onPress={() => dismiss(btn.onPress)}
                        style={[
                          styles.cancelButton,
                          isTwoButtons && { flex: 1, marginRight: 8 },
                          {
                            backgroundColor: isDark
                              ? 'rgba(255, 255, 255, 0.07)'
                              : '#F1F5F9',
                            borderColor: isDark
                              ? 'rgba(255, 255, 255, 0.12)'
                              : '#CBD5E1',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.cancelButtonText,
                            { color: isDark ? '#CBD5E1' : '#334155' },
                          ]}
                        >
                          {btn.text || 'Cancel'}
                        </Text>
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.85}
                      onPress={() => dismiss(btn.onPress)}
                      style={[
                        styles.actionButtonWrapper,
                        isTwoButtons && { flex: 1.25, marginLeft: 8 },
                      ]}
                    >
                      <LinearGradient
                        colors={btnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.actionGradient}
                      >
                        <Text style={styles.actionButtonText}>
                          {btn.text || 'OK'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ============================================
// 🚀 STATIC METHODS & PUBLIC API
// ============================================

// Standalone trigger for programmatic or global use
export const showAlert = (title, message, buttons = [], options = {}) => {
  if (activeAlertListener) {
    activeAlertListener({
      title,
      message,
      buttons,
      cancelable: options.cancelable !== false,
    });
  } else {
    // Fallback to NativeAlert if component not yet mounted
    NativeAlert.alert(title, message, buttons, options);
  }
};

// Direct show with explicit configuration
export const showFitAlert = (config) => {
  if (activeAlertListener) {
    activeAlertListener(config);
  } else {
    NativeAlert.alert(config.title, config.message, config.buttons);
  }
};

// Convenience helpers
export const showSuccess = (title, message, onPress) => {
  showFitAlert({
    type: 'success',
    title,
    message,
    buttons: [{ text: 'Awesome', onPress, style: 'default' }],
  });
};

export const showError = (title, message, onPress) => {
  showFitAlert({
    type: 'error',
    title: title || 'Error',
    message,
    buttons: [{ text: 'Got it', onPress, style: 'default' }],
  });
};

export const showWarning = (title, message, onPress) => {
  showFitAlert({
    type: 'warning',
    title: title || 'Warning',
    message,
    buttons: [{ text: 'Understood', onPress, style: 'default' }],
  });
};

export const showConfirm = (title, message, onConfirm, onCancel, options = {}) => {
  showFitAlert({
    type: 'confirm',
    title,
    message,
    buttons: [
      { text: options.cancelText || 'Cancel', style: 'cancel', onPress: onCancel },
      {
        text: options.confirmText || 'Confirm',
        style: options.isDestructive !== false ? 'destructive' : 'default',
        onPress: onConfirm,
      },
    ],
  });
};

// Global Monkey-Patch to seamlessly upgrade all native Alert.alert calls
export const installFitAlert = () => {
  NativeAlert.alert = (title, message, buttons, options) => {
    showAlert(title, message, buttons, options);
  };
};

// FitAlert object for convenient default export
FitAlert.alert = showAlert;
FitAlert.show = showFitAlert;
FitAlert.success = showSuccess;
FitAlert.error = showError;
FitAlert.warning = showWarning;
FitAlert.confirm = showConfirm;
FitAlert.install = installFitAlert;

export const Alert = FitAlert;
export default FitAlert;

// ============================================
// 💅 STYLES
// ============================================
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: Math.min(width * 0.88, 380),
    borderRadius: 24,
    borderWidth: 1.2,
    paddingTop: 36,
    paddingBottom: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  badgeWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badgeGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    opacity: 0.6,
  },
  badgeGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 14.5,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  buttonContainer: {
    width: '100%',
  },
  twoButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  multipleButtonsColumn: {
    flexDirection: 'column',
    gap: 10,
  },
  cancelButton: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  actionButtonWrapper: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
