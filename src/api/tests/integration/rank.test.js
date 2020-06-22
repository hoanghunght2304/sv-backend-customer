/* eslint-disable no-undef */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
import { Op } from 'sequelize';
import request from 'supertest';
import httpStatus from 'http-status';
import { expect } from 'chai';
import { omit } from 'lodash';
import app from '../../../index';
import Rank from '../../../common/models/rank.model';

const token = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNoYWR5bG92ZSIsInBob25lIjoiMDk4ODg4ODg4OCIsImVtYWlsIjoiZW1haWxAZ21haWwuY29tIiwibmFtZSI6Ik5ndXnhu4VuIFbEg24gVGjDoG5oIiwiYXZhdGFyIjoiL3N0b3JhZ2VzL2F2YXRhci9kZWZhdWx0LmpwZyIsImV4cCI6MTU4NDE0ODQyNCwiaWF0IjoxNTg0MDYyMDI0LCJhdWQiOiJ3ZWIiLCJpc3MiOiJhdXRoLmR1eW5ndXllbnRhaWxvci5jb20vdXNlci93ZWIifQ.Wfa3aP4nq0mWqukwHUogMRtDSCu0mckA63FAWrnd0Rt5vFKw1KZFdWdpcK3BKnJgoLFAr9V1FkLQebsgOH15zJJFw0RLufPh35hzIkLwu4WIfnsRyOgHmTD9zwncFenoLhRtcpSfC4i8MnbXrt1MuYcEyLIgiB4P7Ia5MmG5WnlPtky9IdBvCZ-P85SMvbe5lP8pGChuzxOO9XqZ2P2wRD4o0cI36cLQ5n_yhy3F7xmufVxR1qfQyb8BLadWQXjQiRQXfpp3Tr2j6tqPq615nbCk_wOU6r0m3Ivy5sfGwYLZK5iOAyyrxtcaLaAvV1XxmfTvVP1PwsTFf-d3-93y7Q';
describe('rank API', async () => {
    let records;
    let newRecord;

    beforeEach(async () => {
        records = [
            {
                id: 'vip',
                name: 'name1',
                note: 'note abc',
                min_price: 10,
                discount: 20,
                created_by: {
                    id: 'hoanghung',
                    name: 'Hoang Hung'
                }
            },
            {
                id: 'vip2',
                name: 'name2',
                note: 'note abc',
                min_price: 20,
                discount: 30,
                created_by: {
                    id: 'hoanghung',
                    name: 'Hoang Hung'
                }
            },
            {
                id: 'vip3',
                name: 'name3',
                note: 'note abc',
                min_price: 30,
                discount: 40,
                created_by: {
                    id: 'hoanghung',
                    name: 'Hoang Hung'
                }
            }
        ];
        newRecord = {
            id: 'vvip',
            name: 'name4',
            note: 'note abc',
            min_price: 40,
            discount: 50,
            created_by: {
                id: 'hoanghung',
                name: 'Hoang Hung'
            }
        };
        await Rank.destroy({
            where: { id: { [Op.ne]: null } }
        });
        await Rank.bulkCreate(records);
    });

    describe('GET /v1/ranks/:id', () => {
        it('should get rank by id', async () => {
            let model = await Rank.findOne({
                id: records[0].id
            });

            model = Rank.transform(model);

            return request(app)
                .get(`/v1/ranks/${model.id}`)
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    expect(res.body.data).to.deep.include(model);
                    console.log('ok');
                });
        });
        it('should report error when id not found', () => {
            return request(app)
                .get('/v1/ranks/asdasdasd')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                    console.log('ok');
                });
        });
    });

    describe('GET /v1/ranks', () => {
        it('should get all ranks', () => {
            return request(app)
                .get('/v1/ranks')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(3);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should get all ranks with skip and limit', () => {
            return request(app)
                .get('/v1/ranks')
                .set('Authorization', token)
                .query({ skip: 2, limit: 10 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(3);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(1);
                    console.log('ok');
                });
        });
        it('should report error when skip is not a number', () => {
            return request(app)
                .get('/v1/ranks')
                .set('Authorization', token)
                .query({ skip: 'asdasd', limit: 20 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('skip');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include('"skip" must be a number');
                    console.log('ok');
                });
        });
        it('should report error when limit is not a number', () => {
            return request(app)
                .get('/v1/ranks')
                .set('Authorization', token)
                .query({ skip: 0, limit: 'dasdasdads' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('limit');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include('"limit" must be a number');
                    console.log('ok');
                });
        });
        it('should get all ranks with keyword', () => {
            return request(app)
                .get('/v1/ranks')
                .set('Authorization', token)
                .query({ keyword: 'vip2' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(1);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(1);
                    console.log('ok');
                });
        });
        it('should get all ranks with discount', () => {
            return request(app)
                .get('/v1/ranks')
                .set('Authorization', token)
                .query({ discount: 30 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(1);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(1);
                    console.log('ok');
                });
        });
        it('should report error when discount parameters is not number', () => {
            return request(app)
                .get('/v1/ranks')
                .set('Authorization', token)
                .query({ discount: 'asdasdas' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('discount');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include(
                        '"discount" must be a number'
                    );
                    console.log('ok');
                });
        });
        it('should get all ranks by created_at with start_time and end_time', () => {
            return request(app)
                .get('/v1/ranks')
                .set('Authorization', token)
                .query({ by_date: 'create', start_time: '03/13/2020', end_time: '03/13/2020' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(3);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should get all ranks by updated_at with start_time and end_time', () => {
            return request(app)
                .get('/v1/ranks')
                .set('Authorization', token)
                .query({ by_date: 'update', start_time: '03/13/2020', end_time: '03/13/2020' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(3);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should report error when start_time parameters is not date', () => {
            return request(app)
                .get('/v1/ranks')
                .set('Authorization', token)
                .query({ by_date: 'create', start_time: 'asdasdas', end_time: '03/13/2020' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('start_time');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include(
                        '"start_time" must be a number of milliseconds or valid date string'
                    );
                    console.log('ok');
                });
        });
        it('should report error when end_time parameters is not date', () => {
            return request(app)
                .get('/v1/ranks')
                .set('Authorization', token)
                .query({ by_date: 'create', start_time: '03/13/2020', end_time: 'asdasdasd' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('end_time');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include(
                        '"end_time" must be a number of milliseconds or valid date string'
                    );
                    console.log('ok');
                });
        });
    });

    describe('POST /v1/ranks', () => {
        it('should create a new rank when request is ok', () => {
            return request(app)
                .post('/v1/ranks')
                .set('Authorization', token)
                .send(newRecord)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when id already exists', () => {
            return request(app)
                .post('/v1/ranks')
                .set('Authorization', token)
                .send(Object.assign({}, newRecord, { id: 'vip' }))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(400);
                    expect(res.body.message).to.equal('Tham số không hợp lệ.!');
                    console.log('ok');
                });
        });
        it('should report error when required fields is not provided', () => {
            const requiredFields = ['id', 'name'];
            newRecord = omit(newRecord, requiredFields);
            return request(app)
                .post('/v1/ranks')
                .set('Authorization', token)
                .send(newRecord)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    for (
                        let index = 0;
                        index < requiredFields.length;
                        index += 1
                    ) {
                        const field = requiredFields[index];
                        expect(res.body.errors[index].field).to.be.equal(
                            `${field}`
                        );
                        expect(res.body.errors[index].location).to.be.equal(
                            'body'
                        );
                        expect(res.body.errors[index].messages).to.include(
                            `"${field}" is required`
                        );
                    }
                });
        });
        it('should create a new rank and set default values', () => {
            const defaultValues = ['note', 'min_price', 'discount'];
            newRecord = omit(
                newRecord, defaultValues
            );
            return request(app)
                .post('/v1/ranks')
                .set('Authorization', token)
                .send(newRecord)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const {
                        created_by,
                        created_at,
                        updated_at
                    } = res.body.data;
                    expect(res.body.code).to.equal(0);
                    expect(created_by).to.be.an('object');
                    expect(created_at).to.be.an('number');
                    expect(updated_at).to.be.an('number');
                });
        });
    });

    describe('PUT /v1/ranks/:id', () => {
        it('should update rank success', () => {
            return request(app)
                .put('/v1/ranks/vip2')
                .set('Authorization', token)
                .send(Object.assign({}, newRecord))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when update a rank with incorrect id', () => {
            return request(app)
                .put('/v1/ranks/sdsada')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                    console.log('ok');
                });
        });
        it('should update correct name rank', () => {
            return request(app)
                .put('/v1/ranks/vip2')
                .set('Authorization', token)
                .send({ name: 'rank update' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect name rank', () => {
            return request(app)
                .put('/v1/ranks/vip2')
                .set('Authorization', token)
                .send({ name: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('name');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"name" must be a string');
                    console.log('ok');
                });
        });
        it('should update correct note rank', () => {
            return request(app)
                .put('/v1/ranks/vip2')
                .set('Authorization', token)
                .send({ note: 'note update' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect note rank', () => {
            return request(app)
                .put('/v1/ranks/vip2')
                .set('Authorization', token)
                .send({ note: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('note');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"note" must be a string');
                    console.log('ok');
                });
        });
        it('should update correct min_price rank', () => {
            return request(app)
                .put('/v1/ranks/vip2')
                .set('Authorization', token)
                .send({ min_price: 40 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect min_price rank', () => {
            return request(app)
                .put('/v1/ranks/vip2')
                .set('Authorization', token)
                .send({ min_price: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('min_price');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"min_price" must be a number');
                    console.log('ok');
                });
        });
        it('should update correct discount rank', () => {
            return request(app)
                .put('/v1/ranks/vip2')
                .set('Authorization', token)
                .send({ discount: 40 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect discount rank', () => {
            return request(app)
                .put('/v1/ranks/vip2')
                .set('Authorization', token)
                .send({ discount: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('discount');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"discount" must be a number');
                    console.log('ok');
                });
        });
    });

    describe('DELETE /v1/ranks/:id', () => {
        it('should report error when delete a rank with incorrect id', () => {
            return request(app)
                .delete('/v1/ranks/sdsada')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                    console.log('ok');
                });
        });
        it('should delete a rank when correct id', () => {
            return request(app)
                .delete('/v1/ranks/vip3')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
    });
});
