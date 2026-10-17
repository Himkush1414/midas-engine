import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Sharing from 'expo-sharing';
import { Pressable, Share, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { useCardShare } from '../useCardShare';

function Harness({ text }: { text: () => string }) {
  const s = useCardShare((ref) => <View ref={ref} testID="card" />, text, 'test');
  return (
    <>
      {s.card}
      <Pressable testID="share" onPress={() => void s.share()} />
    </>
  );
}

describe('useCardShare', () => {
  const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });
  beforeEach(() => {
    shareSpy.mockClear();
    (Sharing.shareAsync as jest.Mock).mockClear();
  });

  it('captures the rendered card and shares it as an image', async () => {
    await render(<Harness text={() => 'text'} />);
    await fireEvent.press(screen.getByTestId('share'));
    await waitFor(() => expect(Sharing.shareAsync).toHaveBeenCalled());
    expect(captureRef).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ format: 'png', width: 1080, height: 1350 }));
    expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///tmp/card.png', expect.objectContaining({ mimeType: 'image/png' }));
    expect(shareSpy).not.toHaveBeenCalled();
  });

  it('falls back to text when the image cannot be shared', async () => {
    (Sharing.shareAsync as jest.Mock).mockRejectedValueOnce(new Error('no share target'));
    await render(<Harness text={() => 'my season'} />);
    await fireEvent.press(screen.getByTestId('share'));
    await waitFor(() => expect(shareSpy).toHaveBeenCalled());
    expect(shareSpy).toHaveBeenCalledWith({ message: 'my season' });
  });
});
