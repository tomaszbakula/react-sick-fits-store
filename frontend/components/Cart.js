import React from 'react';
import { Query, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';

const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

const Cart = props => (
  <Query query={LOCAL_STATE_QUERY}>
    {({ data: { cartOpen } }) => (
      <CartStyles open={cartOpen}>

        <header>
          <ApolloConsumer>
            {client => (
              <CloseButton
                title="close"
                onClick={() => client.writeData({ data: { cartOpen: !cartOpen }})}
              >&times;</CloseButton>
            )}
          </ApolloConsumer>
          <Supreme>Your Cart</Supreme>
          <p>You have __ items in your cart.</p>
        </header>

        <footer>
          <p>$11.10</p>
          <SickButton>Checkout</SickButton>
        </footer>

      </CartStyles>
    )}
  </Query>
);

export default Cart;
export { LOCAL_STATE_QUERY };