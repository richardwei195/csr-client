import CSRClient from '../src'
import * as expect from 'should'

describe('Index', () => {
  it('should request success', async () => {
    const client = new CSRClient()

    const res = await client.execute({
      url: 'https://baidu.com'
    })

    expect(res.body).not.null()
  })
})