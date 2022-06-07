import { render, screen } from '@testing-library/react';
import Posts, { getStaticProps } from '../../pages/posts';
import { getPrismicClient } from '../../services/prismic';

const posts = [
  { slug: 'my-new-post', title: 'my new post', excerpt: 'post excerpt', updatedAt: '10 de Abril' }
];

jest.mock('../../services/prismic');

describe('Posts page', () => {
  it('renders correctly', () => {
    render(<Posts posts={posts} />)
    expect(screen.getByText('my new post')).toBeInTheDocument();
  });

  it('load initial data', async () => {
    const getPrismicClientMocked = jest.mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getAllByType: jest.fn().mockResolvedValueOnce([
        {
          uid: 'my-new-post',
          data: {
            title: [
              { type: 'heading', text: 'my new post' }
            ],
            content: [
              { type: 'paragraph', text: 'post excerpt' }
            ],
          },
          last_publication_date: '06-02-2022'
        }
      ])
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [{
            slug: 'my-new-post',
            title: 'my new post',
            excerpt: 'post excerpt',
            updatedAt: '02 de junho de 2022'
          }]
        }
      })
    )
  })
})
