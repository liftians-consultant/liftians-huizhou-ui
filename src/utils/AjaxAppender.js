import * as log4js from 'log4js2';
import axios from 'axios';

class AjaxAppender extends log4js.LogAppender {
  constructor(configuration) {
    super();
    this.endpoint = configuration.url;
    this.httpMethod = configuration.method;
    this.httpHeaders = configuration.headers;
    this.batchSize = configuration.batchSize;
    this.batch = [];
  }

  getName = () => 'AjaxAppender';

  /**
   * Appends the log event.
   * @param logEvent
   */
  append = (logEvent) => {
    if (logEvent.level <= this.getLogLevel()) {
      const message = this.format(logEvent);

      this.batch.push(message);

      if (!this.batch.length < this.batchSize) {
        axios.request({
          url: this.endpoint,
          method: this.httpMethod,
          headers: this.httpHeaders,
          data: this.batch,
        }).then(() => {
          this.batch = [];
        }).catch((e) => {
          throw new Error(e.toString());
        });
      }
    }
  }
}

/**
 * Provide a new AjaxAppender instance through an executable function.
 * @param {} configuration An object that provide http configuration for the appender.
 *
 * @return An executable function that will create a new instance of AjaxAppender with provided configuration object.
 */
// eslint-disable-next-line
export function AjaxAppenderProvider (configuration) {
  return () => new AjaxAppender(configuration);
}
