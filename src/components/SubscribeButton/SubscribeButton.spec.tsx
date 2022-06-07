import { fireEvent, render, screen } from '@testing-library/react';
import { SubscribeButton } from './index';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

jest.mock('next/router');
jest.mock('next-auth/react');

describe('SubscribeButton component', () => {
  it('renders correctly', () => {
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce({ data: null, status: 'loading' });
    render(
      <SubscribeButton />
    );

    expect(screen.getByText('Subscribe now')).toBeInTheDocument();
  });

  it('redirects user to sign in when not authenticated', () => {
    const signInMocked = jest.mocked(signIn);
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce({ data: null, status: 'loading' });

    render(<SubscribeButton />);
    const subscribeButton = screen.getByText('Subscribe now');
    fireEvent.click(subscribeButton);

    expect(signInMocked).toHaveBeenCalled();
  });

  it('redirects to posts when user already has a subscription', () => {
    const useRouterMocked = jest.mocked(useRouter);
    const useSessionMocked = jest.mocked(useSession);
    const pushMock = jest.fn();
    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);
    useSessionMocked.mockReturnValueOnce({
      data: {
        user: { name: "John Doe", email: "john.doe@example.com" },
        expires: "fake-expires",
        activeSubscription: 'fake-active-subscription'
      },
    } as any);

    render(<SubscribeButton />);
    const subscribeButton = screen.getByText('Subscribe now');
    fireEvent.click(subscribeButton);

    expect(pushMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/posts');
  });
});
