import apn from 'apn';

const apnProviderFactory = () => {
	return new apn.Provider({
		token: {
			key: process.env.KEY_PATH ?? Buffer.from(process.env.ENCODED_KEY ?? '', 'base64'),
			keyId: process.env.KEY_ID!,
			teamId: process.env.KEY_TEAM_ID!
		}
	});
};

export default apnProviderFactory;
