import { render, screen } from '@testing-library/react';
import { getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import PostPreview, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { getPrismicClient } from '../../services/prismic';

const post = { slug: 'my-new-post', title: 'my new post', content: '<p>post content</p>', updatedAt: '10 de Abril' };

jest.mock('../../services/prismic');
jest.mock('next-auth/react');
jest.mock('next/router');

describe('PostPreview page', () => {
  it('renders correctly', () => {
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce({ data: null, status: 'loading' });

    render(<PostPreview post={post} />)
    expect(screen.getByText('my new post')).toBeInTheDocument();
    expect(screen.getByText('post content')).toBeInTheDocument();
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
  });

  it('redirects user to full post when user is subscribed', async () => {
    const useSessionMocked = jest.mocked(useSession);
    const useRouterMocked = jest.mocked(useRouter);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce({
      data: {
        user: { name: "John Doe", email: "john.doe@example.com" },
        expires: "fake-expires",
        activeSubscription: 'fake-active-subscription'
      },
    } as any);

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<PostPreview post={post} />);

    expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post');
  });

  it('load initial data', async () => {
    const getPrismicClientMocked = jest.mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: 'my new post' }
          ],
          content: [
            { type: 'paragraph', text: 'post content' }
          ],
        },
        last_publication_date: '06-02-2022'
      })
    } as any);

    const response = await getStaticProps({
      params: {
        slug: 'my-new-post'
      }
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            content: '<p>post content</p>',
            title: 'my new post',
            updatedAt: '02 de junho de 2022'
          }
        }
      })
    )
  });
})
