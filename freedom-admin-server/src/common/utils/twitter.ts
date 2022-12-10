import Twitter, { TwitterOptions } from 'twitter-lite';

const consumer_key = 'FHYmd2bOK32HaRN73eed8hZVt';
const consumer_secret = 's3yUITb3oARoZHeBGO7HvSvzTLOjhAv8ClB7AKycyQpkZXSInn';
const access_token_key = '1541296529314459648-j4kotdtsYd7VIkULsg4QB6WL9HL5Zv';
const access_token_secret = 'nHVkZWkjWQoym89sE95upGcj6xEy8pL6sUz2tu50WZDMm';

const config: TwitterOptions = {
  consumer_key,
  consumer_secret,
  access_token_key,
  access_token_secret,
  version: '2',
  extension: false, // true is the default (this must be set to false for v2 endpoints)
};

const client = new Twitter(config);

const getUserdata = async (tuname: any) => {
  try {
    const resp = await client.get('users/lookup', { screen_name: tuname });
    if (!resp[0]?.id_str) throw 'Invalid Twitter Handler Name!';
    return resp[0]?.id_str;
  } catch (err) {
    throw JSON.stringify(err);
  }
};

const getFollowersByScreenName = async (screen_name: string) => {
  // const response = await client.getBearerToken();
  try {
    const result = await client.get('friends/list', {
      count: 200,
      skip_status: true,
      screen_name,
    });
    return result;
  } catch (error) {
    return {
      users: [],
    };
  }
};

export { getUserdata, client, getFollowersByScreenName };
