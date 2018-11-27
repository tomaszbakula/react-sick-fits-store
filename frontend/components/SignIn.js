import React, { Component } from 'react'
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id, email, name
    }
  }
`;

class SignIn extends Component {
  state = {
    name: '',
    email: '',
    password: ''
  }

  saveToState = ({ target: { name, value } }) => {
    this.setState({ [name]: value });
  }

  onSubmit = async (signin, e) => {
    e.preventDefault();
    await signin();
    this.setState({
      name: '',
      email: '',
      password: ''
    });
  }

  render() {
    return (
      <Mutation
        mutation={SIGNIN_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signin, { error, loading }) => (
          <Form method="POST" onSubmit={e => this.onSubmit(signin, e)}>
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign Into Your Account</h2>
              <Error error={error} />
              <label htmlFor="email">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="email"
                  value={this.state.email}
                  onChange={this.saveToState}
                />
              </label>

              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  value={this.state.password}
                  onChange={this.saveToState}
                />
              </label>

              <button type="submit">Sign In!</button>

            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default SignIn;