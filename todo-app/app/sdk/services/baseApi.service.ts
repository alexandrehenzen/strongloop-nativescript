/* tslint:disable */
import { Injectable, Inject, Optional } from '@angular/core';
import { Http, Headers, Request } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { LoopBackAuth } from './auth.service';
import { LoopBackConfig } from './config.service';
import { ErrorHandler } from './errorHandler.service';

@Injectable()
export abstract class BaseLoopBackApi {

  protected path: string;

  constructor(
    @Inject(Http) protected http: Http, 
    @Inject(LoopBackAuth) protected auth: LoopBackAuth, 
    @Optional() @Inject(ErrorHandler) protected errorHandler: ErrorHandler
  ) {
    if (!auth) {
      this.auth = new LoopBackAuth();
    }
    if (!errorHandler) {
      this.errorHandler = new ErrorHandler();
    }
  }

  /**
   * Process request
   * @param string  method    Request method (GET, POST, PUT)
   * @param string  url       Request url (my-host/my-url/:id)
   * @param any     urlParams Values of url parameters
   * @param any     params    Parameters for building url (filter and other)
   * @param any     data      Request body
   * @param boolean isio      Request socket connection
   */
  public request(method: string, url: string, urlParams: any = {},
    params: any = {}, data: any = null) {    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    if (this.auth.getAccessTokenId()) {
      headers.append('Authorization', this.auth.getAccessTokenId());
    }

    let requestUrl = url;
    let key: string;
    for (key in urlParams) {
      requestUrl = requestUrl.replace(new RegExp(":" + key + "(\/|$)", "g"), urlParams[key] + "$1");
    }

    let parameters: string[] = [];
    for (var param in params) {
      parameters.push(param + '=' + (typeof params[param] === 'object' ? JSON.stringify(params[param]) : params[param]));
    }
    requestUrl += (parameters ? '?' : '') + parameters.join('&');

      let request = new Request({
        headers: headers,
        method: method,
        url: requestUrl,
        body: data ? JSON.stringify(data) : undefined
      });
      return this.http.request(request)
        .map(res => (res.text() != "" ? res.json() : {}))
        .catch(this.errorHandler.handleError);
  }
}
