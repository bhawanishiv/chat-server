import { connect } from 'mongoose';
import { DB_NAME, DB_USER, DB_PASSWORD, DB_SERVER } from 'app/lib/constants';

const mongoServer = () => {
  const options = { useNewUrlParser: true, useUnifiedTopology: true };

  if (process.env.NODE_ENV === 'production') {
    return connect(
      `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_SERVER}/${DB_NAME}?retryWrites=true&w=majority`,
      options
    );
  }

  return connect(`mongodb://${DB_SERVER}/${DB_NAME}`, options);
};
export default mongoServer;
