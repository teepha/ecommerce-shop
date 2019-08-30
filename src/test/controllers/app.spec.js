import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';

chai.use(chaiHttp);

describe('Test for Welcome page', () => {
  it('should return a status of 404 for a non found page', async () => {
    const response = await chai.request(app).get('/me/notfound');
    expect(response.statusCode).to.equal(404);
    expect(response.body.status).to.be.false;
    expect(response.body.error.message).to.equal('Resource does not exist');
  });

  it('should return a status of 404 for a non found page', async () => {
    const response = await chai.request(app).get('/');
    expect(response.status).to.equal(200);
    expect(response.body.success).to.be.true;
    expect(response.body.message).to.equal(
      'Welcome to Turing E-commerce shop api, your goal is to implement the missing code or fix the bugs inside this project'
    );
  });
});
