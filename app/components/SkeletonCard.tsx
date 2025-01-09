import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '~/components/ui/skeleton';

interface SkeletonCardProps {
  // Add any props if needed
}

export const SkeletonCard: React.FC<SkeletonCardProps> = () => {
  return (
    <View className="flex flex-col gap-3 bg-white gap-5 p-6 rounded-xl w-full max-w-sm">
      <Skeleton className="h-32 rounded-xl" />
      <View className="gap-2">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-52" />
      </View>
    </View>
  );
};

export default SkeletonCard;
