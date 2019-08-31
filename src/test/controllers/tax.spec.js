import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';

chai.use(chaiHttp);

describe('API Tests for Tax Controller functions', () => {
  const tax_id = 1;

  it('should get all taxes', async () => {
    const response = await chai.request(app).get('/tax');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  });

  it('should get a single tax using the tax_id supplied', async () => {
    const response = await chai.request(app).get(`/tax/${tax_id}`);
    expect(response.status).to.equal(200);
    expect(response.body.tax_id).to.be.an(tax_id);
  });
});
