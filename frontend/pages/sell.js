import CreateItem from '../components/CreateItem';
import PleaseSignIn from '../components/PleaseSignIn';

const SellPage = props => (
  <div>
    <PleaseSignIn>
      <CreateItem />
    </PleaseSignIn>
  </div>
);

export default SellPage;