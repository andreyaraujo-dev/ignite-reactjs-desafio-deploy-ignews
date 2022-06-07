import { render, screen } from '@testing-library/react';
import { getSession } from 'next-auth/react';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { getPrismicClient } from '../../services/prismic';

const post = { slug: 'my-new-post', title: 'my new post', content: '<p>post content</p>', updatedAt: '10 de Abril' };

jest.mock('../../services/prismic');
jest.mock('next-auth/react');

describe('Post page', () => {
  it('renders correctly', () => {
    render(<Post post={post} />)
    expect(screen.getByText('my new post')).toBeInTheDocument();
    expect(screen.getByText('post content')).toBeInTheDocument();
  });

  it('redirects user if no subscription is found', async () => {
    const getSessionMocked = jest.mocked(getSession);
    getSessionMocked.mockResolvedValueOnce(null);

    const response = await getServerSideProps({
      params: {
        slug: 'my-new-post'
      }
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/'
        })
      })
    )
  });

  it('load initial data', async () => {
    const getSessionMocked = jest.mocked(getSession);
    const getPrismicClientMocked = jest.mocked(getPrismicClient);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription'
    } as any);
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

    const response = await getServerSideProps({
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
