import { Query } from 'react-apollo';
import gql from 'graphql-tag'
import Error from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';
import propTypes from 'prop-types';

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE'
];

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id, name, email, permissions
    }
  }
`;

const Permissions = props => <Query query={ALL_USERS_QUERY}>
  {({ data, loading, error }) => (
    <>
      <Error error={error} />
      <div>
        <h2>Manage Permissions</h2>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              {possiblePermissions.map(perm => <th key={perm}>{perm}</th>)}
              <th>👇🏾</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map(user => <User key={user.id} user={user} />)}
          </tbody>
        </Table>
      </div>
    </>
  )}
</Query>

class User extends React.Component {
  static propTypes = {
    user: propTypes.shape({
      id: propTypes.string,
      name: propTypes.string,
      email: propTypes.string,
      permissions: propTypes.array
    }).isRequired
  }

  state = {
    permissions: this.props.user.permissions
  }

  handlePermissionChange = e => {
    const checkbox = e.target;
    let updatedPermissions = [...this.state.permissions];
    if (checkbox.checked) {
      updatedPermissions.push(checkbox.value);
    } else {
      updatedPermissions = updatedPermissions.filter(perm => perm !== checkbox.value);
    }
    this.setState({ permissions: updatedPermissions });
    console.log(updatedPermissions)
  }

  render() {
    const user = this.props.user;
    return (
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {possiblePermissions.map(perm => (
          <td key={perm}>
            <label htmlFor={`${user.id}-permission-${perm}`}>
              <input
                id={`${user.id}-permission-${perm}`}
                type="checkbox"
                value={perm}
                onChange={this.handlePermissionChange}
                checked={this.state.permissions.includes(perm)}
              />
            </label>
          </td>
        ))}
        <td>
          <SickButton>Update</SickButton>
        </td>
      </tr>
    );
  }
}

export default Permissions;