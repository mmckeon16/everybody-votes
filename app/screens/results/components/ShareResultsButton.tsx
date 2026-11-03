import React, { useEffect, useRef, useState } from 'react';
import { findNodeHandle, Platform, Share, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

type Props = { question: { id: string; text: string } };

export default function ShareResultsButton({ question }: Props) {
  const [isSharing, setIsSharing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const anchor = useRef<View>(null);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  if (Platform.OS === 'web' || !question.id) return null;

  const shareResults = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsSharing(true);
    setHasError(false);
    const url = `https://www.everybodypolls.com/shared/${encodeURIComponent(question.id)}`;
    try {
      const anchorNode = findNodeHandle(anchor.current);
      await Share.share({
        title: 'Everybody Polls results',
        message: Platform.OS === 'ios' ? question.text : `${question.text}\n${url}`,
        ...(Platform.OS === 'ios' ? { url } : {}),
      }, {
        dialogTitle: 'Share poll results',
        subject: 'Everybody Polls results',
        ...(anchorNode ? { anchor: anchorNode } : {}),
      });
      // Dismissal is a normal outcome. Opening the chooser does not confirm a send.
    } catch {
      if (mounted.current) setHasError(true);
    } finally {
      inFlight.current = false;
      if (mounted.current) setIsSharing(false);
    }
  };

  return (
    <View ref={anchor} collapsable={false} className="w-full max-w-3xl gap-2">
      <Button variant="outline" accessibilityRole="button" disabled={isSharing} onPress={shareResults}>
        <Text>{isSharing ? 'Opening share options…' : 'Share results'}</Text>
      </Button>
      {hasError && (
        <Text accessibilityLiveRegion="polite" className="text-center text-sm">
          Could not open sharing. Please try again.
        </Text>
      )}
    </View>
  );
}
