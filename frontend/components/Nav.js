import Link from 'next/link';
import { ApolloConsumer } from 'react-apollo';
import User from './User'
import NavStyles from './styles/NavStyles';
import SignOut from './SignOut'
import CartCount from './CartCount'

const Nav = () => (
    <User>
      {({ data: { me }}) => (
        <NavStyles>
          <Link href="/items"><a>Shop</a></Link>
          {me && (
            <>
              <Link href="/sell"><a>Sell</a></Link>
              <Link href="/orders"><a>Orders</a></Link>
              <Link href="/me"><a>Account</a></Link>
              <SignOut />
              <ApolloConsumer>{client => (
                <button onClick={() => client.writeData({ data: { cartOpen: true }})}>
                  My Cart
                  <CartCount count={me.cart.reduce((total, cartItem) => total + cartItem.quantity, 0)} />
                </button>
              )}</ApolloConsumer>
            </>
          )}
          {!me && (
            <Link href="/signup"><a>Sign In</a></Link>
          )}
        </NavStyles>
      )}
    </User>
);

export default Nav;