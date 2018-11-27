import React from 'react';
import PaginationStyles from './styles/PaginationStyles';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Head from 'next/head';
import Link from 'next/link';
import Error from './ErrorMessage';
import { perPage } from '../config';

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;

const Pagination = props => (
  <Query query={PAGINATION_QUERY}>
    {({ data, loading, error }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <Error error={error} />;
      console.log(data)
      const count = data.itemsConnection.aggregate.count;
      const pages = Math.ceil(count / perPage);
      const page = props.page;
      return (
        <PaginationStyles>
          <Head>
            <title>Sick Fits - {page} of {pages}</title>
          </Head>

          <Link
            prefetch
            href={{
            pathname: '/items',
            query: { page: page - 1 }
            }}
          >
            <a className="prev" aria-disabled={page <= 1}>Prev</a>
          </Link>

          <p>Page {page} of {pages}</p>
          <p>{count} item{count <= 1 || 's'} total</p>

          <Link href={{
            pathname: '/items',
            query: { page: page + 1 }
          }}>
            <a className="next" aria-disabled={page >= pages}>Next</a>
          </Link>

        </PaginationStyles>
      )
    }}
  </Query>
);

export default Pagination;