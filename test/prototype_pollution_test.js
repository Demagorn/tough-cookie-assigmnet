/*!
 * Copyright (c) 2015, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of Salesforce.com nor the names of its contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';

var vows = require('vows');
var assert = require('assert');
var tough = require('../lib/cookie');

vows.describe('Prototype Pollution Fix (CVE-2023-26136)').addBatch({
  'when setting a cookie with the domain __proto__': {
    topic: function() {
      const jar = new tough.CookieJar(undefined, {
        rejectPublicSuffixes: false
      });
      
      // try to pollute the prototype
      jar.setCookieSync(
        "Slonser=polluted; Domain=__proto__; Path=/notauth",
        "https://__proto__/admin"
      );
      jar.setCookieSync(
        "Auth=Lol; Domain=google.com; Path=/notauth",
        "https://google.com/"
      );
      
      this.callback();
    },
    'results in a cookie that is not affected by the attempted prototype pollution': function() {
      const pollutedObject = {};
      assert(pollutedObject["/notauth"] === undefined);
    }
  },
  'after calling removeAllCookies, prototype pollution is still prevented': {
    topic: function() {
      const jar = new tough.CookieJar(undefined, {
        rejectPublicSuffixes: false
      });
      // pollute, then clear
      jar.setCookieSync(
        "Slonser=polluted; Domain=__proto__; Path=/notauth",
        "https://__proto__/admin"
      );
      jar.removeAllCookiesSync();
      this.callback();
    },
    'Object.prototype is not polluted after removeAllCookies': function() {
      const pollutedObject = {};
      assert(pollutedObject["/notauth"] === undefined);
    }
  }
}).export(module); 