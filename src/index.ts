import * as client from 'request'

// the max request times if timeout
const MAX_ATTEMPTS: number = 3

// determines the retry delay time in milliseconds until a request is established.
const RETRY_DELAY = 1000

// this options controls two timeouts
// - if TCP can't connected, this control is't effected, depend on OS
// - generally, this controls socket to timeout
const REQ_TIMEOUT = 2000

// const RETRIABLE_ERRORS = ['ECONNRESET', 'ENOTFOUND', 'ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNREFUSED', 'EHOSTUNREACH', 'EPIPE', 'EAI_AGAIN']

interface RequestOptions extends client.OptionsWithUrl {
  retryDelay?: number
  maxAttempts?: number
}

export default class CSRClient {
  private _retryDelay: number
  private _attempts: number
  private _maxAttempts: number
  private _followTime: number
  private _switchWingman: boolean
  private _options: RequestOptions

  constructor () {
    this._switchWingman = false
    this._attempts = 0
  }

  openWingman (followTime: number) {
    this._switchWingman = true
    this._followTime = followTime || 200

    return this
  }

  public async execute(options: RequestOptions): Promise<client.Response> {

    this._options = options

    this._retryDelay = options.retryDelay ? Math.floor(options.retryDelay) : RETRY_DELAY
    this._maxAttempts = options.maxAttempts ? Math.floor(options.maxAttempts) : MAX_ATTEMPTS
    this._options.timeout = options.timeout || REQ_TIMEOUT

    if (this._switchWingman) {
      return await Promise.race([
        this.main(),
        this._wingman()
      ])
    } else {
      return await this.main()
    }
  }

  private async main(): Promise<client.Response> {
    this._attempts++

    while (this._maxAttempts > this._attempts) {
      try {
        return await this.requestPromise()
      } catch (error) {
        await this._delay()
        return await this.requestPromise()
      }
    }
  }

  private requestPromise(): Promise<client.Response> {
    return new Promise((resolve, reject) => {
      client(this._options, (err, response: client.Response, body) => {
        if (err) {
          reject(err)
        }
        resolve(response)
      })
    })
  }

  /**
   * execute after last request as a wingman
   * @private
   */
  private async _wingman () {
    await this._delay(this._followTime)

    return await this.main()
  }

  /**
   * method for wait
   */
  private _delay (delay?: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, delay || this._retryDelay)
    })
  }
}