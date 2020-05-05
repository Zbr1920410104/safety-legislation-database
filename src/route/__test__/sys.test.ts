import server from '../../www';
import request = require('supertest');
import assert = require('assert');
import { afterEach } from 'mocha';

describe('sys', () => {
  let agent: request.SuperTest<request.Test>;

  beforeEach(() => {
    agent = request.agent(server);
  });
  describe('GET /personList', () => {
    it('param empty', done => {
      agent
        .get('/sys/personList')
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
        })
        .end(done);
    });

    it('"" name', done => {
      agent
        .get('/sys/personList')
        .query({
          name: '',
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 0);
        })
        .end(done);
    });

    it('only name', done => {
      agent
        .get('/sys/personList')
        .query({
          name: 'Brock Adams',
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 1);
        })
        .end(done);
    });

    it('"a" and max is 5', done => {
      agent
        .get('/sys/personList')
        .query({
          name: 'a',
          max: 5,
        })
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length === 5);
        })
        .end(done);
    });

    it('name is too lang', done => {
      let name = '';

      for (let i = 0; i <= 300; i++) {
        name += 'a';
      }

      agent
        .get('/sys/personList')
        .query({
          name,
        })
        .expect(400, err => {
          done(err);
        });
    });

    it('"max" less than 1', done => {
      agent
        .get('/sys/personList')
        .query({
          name: 'a',
          max: 0,
        })
        .expect(400, err => {
          done(err);
        });
    });

    it('"max" very large', done => {
      agent
        .get('/sys/personList')
        .query({
          name: 'a',
          max: 999999,
        })
        .expect(res => {
          assert(Array.isArray(res.body));
          assert(res.body.length > 0);
        })
        .end(done);
    });
  });

  afterEach(() => {
    server.close();
  });
});