import React from 'react';
import { Query, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
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

const Cart = props => (
  <User>
    {({ data: { me }}) => {
      if (!me) return null;
      console.log(me)
      return (
        <Query query={LOCAL_STATE_QUERY}>
          {({ data: { cartOpen } }) => (
            <CartStyles open={cartOpen}>

              <header>
                <ApolloConsumer>
                  {client => (
                    <CloseButton
                      title="close"
                      onClick={() => client.writeData({ data: { cartOpen: false }})}
                    >&times;</CloseButton>
                  )}
                </ApolloConsumer>
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
          )}
        </Query>
      );
    }}
  </User>
);

export default Cart;
export { LOCAL_STATE_QUERY };