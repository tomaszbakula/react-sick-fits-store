import React, { Component } from 'react'
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import propTypes from 'prop-types'
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

const RESET_MUTATION = gql`
  mutation RESET_MUTATION(
    $resetToken: String!,
    $password: String!,
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken,
      password: $password,
      confirmPassword: $confirmPassword
    ) {
      id,
      email,
      name
    }
  }
`;

class Reset extends Component {
  static propTypes = {
    resetToken: propTypes.string.isRequired
  }

  state = {
    password: '',
    confirmPassword: ''
  }

  saveToState = ({ target: { name, value } }) => {
    this.setState({ [name]: value });
  }

  onSubmit = async (reset, e) => {
    e.preventDefault();
    await reset();
    this.setState({
      password: '',
      confirmPassword: ''
    });
  }

  render() {
    return (
      <Mutation
        mutation={RESET_MUTATION}
        variables={{
          resetToken: this.props.resetToken,
          password: this.state.password,
          confirmPassword: this.state.confirmPassword
        }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(reset, { error, loading, called }) => (
          <Form method="POST" onSubmit={e => this.onSubmit(reset, e)}>
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Reset Your Password</h2>
              <Error error={error} />

              <label htmlFor="password">
                Your New Password
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  value={this.state.password}
                  onChange={this.saveToState}
                />
              </label>

              <label htmlFor="confirmPassword">
                Confirm Your Password
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="confirmPassword"
                  value={this.state.confirmPassword}
                  onChange={this.saveToState}
                />
              </label>

              <button type="submit">Reset Your Password!</button>

            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default Reset;