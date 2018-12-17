import React from 'react';
import { Query, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import { adopt } from 'react-adopt';
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';
import User from './User';
import CartItem from './CartItem';
import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';

const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

const Composed = adopt({
  user: ({ render }) => <User>{render}</User>,
  toggleCart: ({ render }) => <ApolloConsumer>{render}</ApolloConsumer>,
  localState: ({ render }) => <Query query={LOCAL_STATE_QUERY}>{render}</Query>
});

const Cart = () => (
  <Composed>
    {({ user, toggleCart, localState }) => {
      const { me } = user.data;
      const { cartOpen } = localState.data;
      if (!me) return null;
      return (
        <CartStyles open={cartOpen}>

          <header>
            <CloseButton
              title="close"
              onClick={() => toggleCart.writeData({ data: { cartOpen: false }})}
            >&times;</CloseButton>
            <Supreme>{me.name}'s Cart</Supreme>
            <p>You have {me.cart.length} item{me.cart.length === 1 ? '' : 's'} in your cart.</p>
          </header>

          <ul>
            {me.cart.map(cartItem => <CartItem key={cartItem.id} cartItem={cartItem} />)}
          </ul>

          <footer>
            <p>{formatMoney(calcTotalPrice(me.cart))}</p>
            <SickButton>Checkout</SickButton>
          </footer>

        </CartStyles>
      );
    }}
  </Composed>
);

export default Cart;
export { LOCAL_STATE_QUERY };