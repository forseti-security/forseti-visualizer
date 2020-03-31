// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import JSONBeautifier from "../../src/services/JSONBeautifier";

describe("JSONBeautifier.test", () => {
  let sut;
  beforeEach(() => {
    sut = JSONBeautifier;
  });
  
  it('beautify returns beautified json object', () => {
    let res = sut.beautify({hi: "world" }, 0, false);
    let expected = `{
    "hi": "world",
}
`;
    expect(res).toEqual(expected);
  });

  it('isJsonString returns true when valid json passed', () => {
    let res = sut.isJsonString('{"hi": "world" }');
    let expected = true;
    expect(res).toEqual(expected);
  });

  it('isJsonString returns false when invalid json passed', () => {
    let res = sut.isJsonString('{{: "world" }');
    let expected = false;
    expect(res).toEqual(expected);
  });

  it('convertStrToJsonObject returns expected 1-tiered json object', () => {
    let res = sut.convertStrToJsonObject('{"hi": "world" }');
    let expected = { hi: 'world' };
    expect(res).toEqual(expected);
  });

  it('convertStrToJsonObject returns expected 2-tiered json object', () => {
    let res = sut.convertStrToJsonObject('{"hi": "world", "hello": {"world": true }}');
    let expected = { hi: 'world', hello: {world: true } };
    expect(res).toEqual(expected);
  });
});