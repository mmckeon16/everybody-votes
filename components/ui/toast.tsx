import Toast, {
  BaseToast,
  ErrorToast,
  ToastProps,
} from 'react-native-toast-message';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Check, X, AlertCircle, Info } from 'lucide-react-native';

/*
  1. Create the config
*/
const toastConfig = {
  success: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderRadius: 8,
        backgroundColor: '#f0fdf4', // emerald-50
        borderColor: '#059669', // emerald-600
        borderWidth: 1,
        borderLeftWidth: 1,
        marginHorizontal: 16,
        marginVertical: 8,
        maxWidth: 'xl',
        padding: 8,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      contentContainerStyle={{
        paddingHorizontal: 0,
      }}
      renderLeadingIcon={() => (
        <View style={{ marginRight: 12, alignSelf: 'center' }}>
          <Check color="#059669" size={20} />
        </View>
      )}
      text1Style={{
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 18,
        letterSpacing: -0.5,
        color: '#111827', // text-gray-900
      }}
      text2Style={{
        fontSize: 14,
        color: '#6B7280', // text-gray-500
      }}
    />
  ),

  error: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderRadius: 8,
        backgroundColor: '#fef2f2', // red-50
        borderColor: '#dc2626', // red-600
        borderWidth: 1,
        borderLeftWidth: 1,
        marginHorizontal: 24,
        marginTop: 24,
        maxWidth: 'xl',
        padding: 8,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      contentContainerStyle={{
        paddingHorizontal: 0,
      }}
      renderLeadingIcon={() => (
        <View style={{ marginRight: 12, alignSelf: 'center' }}>
          <X color="#dc2626" size={16} />
        </View>
      )}
      text1Style={{
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 18,
        letterSpacing: -0.5,
        color: '#111827', // text-gray-900
      }}
      text2Style={{
        fontSize: 14,
        color: '#6B7280', // text-gray-500
      }}
    />
  ),

  warning: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderRadius: 8,
        backgroundColor: '#fefce8', // yellow-50
        borderColor: '#ca8a04', // yellow-600
        borderWidth: 1,
        borderLeftWidth: 1,
        marginHorizontal: 24,
        marginTop: 24,
        maxWidth: 'xl',
        padding: 8,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      contentContainerStyle={{
        paddingHorizontal: 0,
      }}
      renderLeadingIcon={() => (
        <View style={{ marginRight: 12, alignSelf: 'center' }}>
          <AlertCircle color="#ca8a04" size={20} />
        </View>
      )}
      text1Style={{
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 18,
        letterSpacing: -0.5,
        color: '#111827', // text-gray-900
      }}
      text2Style={{
        fontSize: 14,
        color: '#6B7280', // text-gray-500
      }}
    />
  ),

  info: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderRadius: 8,
        backgroundColor: '#eff6ff', // blue-50
        borderColor: '#2563eb', // blue-600
        borderWidth: 1,
        borderLeftWidth: 1,
        marginHorizontal: 24,
        marginTop: 24,
        maxWidth: 'xl',
        padding: 8,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      contentContainerStyle={{
        paddingHorizontal: 0,
      }}
      renderLeadingIcon={() => (
        <View style={{ marginRight: 12, alignSelf: 'center' }}>
          <Info color="#2563eb" size={20} />
        </View>
      )}
      text1Style={{
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 18,
        letterSpacing: -0.5,
        color: '#111827', // text-gray-900
      }}
      text2Style={{
        fontSize: 14,
        color: '#6B7280', // text-gray-500
      }}
    />
  ),
};
const CustomToast = () => {
  /*
  2. Pass the config as prop to the Toast component instance
*/

  return <Toast config={toastConfig} />;
};

export default CustomToast;
