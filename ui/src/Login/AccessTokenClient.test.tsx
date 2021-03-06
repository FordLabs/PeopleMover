import Axios from 'axios';
import Cookies from 'universal-cookie';
import {AccessTokenClient} from './AccessTokenClient';

describe('Access Token Client', function() {

    const cookies = new Cookies();
    let accessToken = '123456';
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    };

    beforeEach(() => {
        cookies.set('accessToken', '123456');
        Axios.post = jest.fn().mockResolvedValue({});
    });

    afterEach(() => {
        cookies.remove('accessToken');
    });

    it('should validate access token and return result', function(done) {
        const expectedUrl = '/api/access_token/validate';
        AccessTokenClient.validateAccessToken(accessToken)
            .then(() => {
                expect(Axios.post).toHaveBeenCalledWith(expectedUrl, { accessToken }, expectedConfig);
                done();
            });
    });

    it('should check user has access to space and return result', function(done) {
        const expectedUrl = '/api/access_token/authenticate';
        const spaceUUID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
        AccessTokenClient.userCanAccessSpace(accessToken, spaceUUID)
            .then(() => {
                expect(Axios.post).toHaveBeenCalledWith(expectedUrl,
                    {
                        accessToken: accessToken,
                        uuid: spaceUUID,
                    },
                    expectedConfig);
                done();
            });
    });
});
