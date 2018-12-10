import React, { Component } from 'react'
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`;

class SignIn extends Component {
  state = {
    email: ''
  }

  saveToState = ({ target: { name, value } }) => {
    this.setState({ [name]: value });
  }

  onSubmit = async (reset, e) => {
    e.preventDefault();
    await reset();
    this.setState({ email: '' });
  }

  render() {
    return (
      <Mutation mutation={REQUEST_RESET_MUTATION} variables={this.state}>
        {(reset, { error, loading, called }) => (
          <Form method="POST" onSubmit={e => this.onSubmit(reset, e)}>
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Request a password reset</h2>
              <Error error={error} />
              {!error && !loading && called && <p>Success! Check your email for a reset link!</p>}
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

              <button type="submit">Request Reset!</button>

            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default SignIn;