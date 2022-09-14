import { connect } from 'mongoose';

import { getMongoConnectUri } from 'app/lib/utils';

const mongoServer = () => connect(getMongoConnectUri());
export default mongoServer;
