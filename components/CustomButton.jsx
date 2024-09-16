import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function CustomButton({ title, handlePress, containerStyles, textStyles, isLoading }) {
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isLoading}
      style={[
        {
          backgroundColor: '#38B2AC', // teal-500 color
          paddingVertical: 16, // py-4
          paddingHorizontal: 36, // px-9
          borderRadius: 9999, // rounded-full
          marginTop: 20, // mt-5
          opacity: isLoading ? 0.5 : 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        containerStyles,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text
          style={[
            {
              color: '#fff',
              fontSize: 18, // text-xl
              fontWeight: 'bold', // font-bold
              textAlign: 'center',
            },
            textStyles,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
