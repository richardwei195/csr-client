import CSRClient from '../src'
import * as expect from 'should'
import * as nock from 'nock'

describe('CSRClient', () => {
  it('should request success', async () => {
    nock('https://blog.richardweitech.cn')
      .get('/test')
      .reply(200, {
        name: 'richardwei'
      })

    const client = new CSRClient()

    const res = await client.execute({
      url: 'https://blog.richardweitech.cn/test',
      json: true
    })

    expect(res.body).not.null()
    expect(res.body.name).eql('richardwei')
  })

  // it('should retry if timeout', async () => {
  //   nock('https://blog.richardweitech.cn')
  //     .get('/test')
  //     .delay(200)
  //     .reply(200, {
  //       name: 'richardwei'
  //     })

  //   const client = new CSRClient()

  //   const res = await client.execute({
  //     url: 'https://blog.richardweitech.cn/test',
  //     json: true,
  //     timeout: 100
  //   })
  //   console.log('log:', res.body)
  //   // expect(res.body).not.null()
  //   // expect(res.body.name).eql('richardwei')
  // })
})