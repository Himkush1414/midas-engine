import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme';
import { SkeletonBlocks, SkeletonRows, StatusNote } from '../Skeleton';

const themed = (node: React.ReactNode) => render(<ThemeProvider preference="dark">{node}</ThemeProvider>);

describe('loading and status placeholders', () => {
  it('announces skeletons as loading', async () => {
    await themed(
      <>
        <SkeletonRows rows={3} />
        <SkeletonBlocks count={2} />
      </>,
    );
    expect(screen.getAllByLabelText('Loading')).toHaveLength(2);
  });

  it('offers a retry only when given one', async () => {
    const onRetry = jest.fn();
    const r = await themed(<StatusNote message="Offline" onRetry={onRetry} />);
    await fireEvent.press(screen.getByText('Try again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
    await r.rerender(
      <ThemeProvider preference="dark">
        <StatusNote message="Offline" />
      </ThemeProvider>,
    );
    expect(screen.queryByText('Try again')).toBeNull();
  });
});
