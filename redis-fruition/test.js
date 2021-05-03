// The existing tests in this file should not be modified,
// but you can add more tests if needed.

const supertest = require('supertest')
const server = require('./server.js')

test('data-storage-api-node', async () => {
  // await supertest(server)
  //   .get('/')
  //   .expect(200)
  
  // PUT
  const putResult = await supertest(server)
    .put('/data/cats')
    .send({ name: 'Copernicus' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(201)

  // GET
  const hash = putResult.body.oid
  await supertest(server)
    .get(`/data/cats/${hash}`)
    .expect(200)
    .then(response => {
      expect(response.body).toEqual({ name: 'Copernicus' })
    })

  // DELETE
  await supertest(server)
    .delete(`/data/cats/${hash}`)
    .expect(200)

  await supertest(server)
    .get(`/data/cats/${hash}`)
    .expect(404)
})
