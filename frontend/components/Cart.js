import React, { Component } from 'react';
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';

const Cart = props => {
  return <CartStyles open={true}>

    <header>
      <CloseButton title="close">&times;</CloseButton>
      <Supreme>Your Cart</Supreme>
      <p>You have __ items in your cart.</p>
    </header>

    <footer>
      <p>$11.10</p>
      <SickButton>Checkout</SickButton>
    </footer>

  </CartStyles>
}

export default Cart;
