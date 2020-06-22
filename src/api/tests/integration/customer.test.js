/* eslint-disable no-undef */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
import { Op } from 'sequelize';
import request from 'supertest';
import httpStatus from 'http-status';
import { expect } from 'chai';
import { omit } from 'lodash';
import app from '../../../index';
import Customer from '../../../common/models/customer.model';

const token = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNoYWR5bG92ZSIsInBob25lIjoiMDk4ODg4ODg4OCIsImVtYWlsIjoiZW1haWxAZ21haWwuY29tIiwibmFtZSI6Ik5ndXnhu4VuIFbEg24gVGjDoG5oIiwiYXZhdGFyIjoiL3N0b3JhZ2VzL2F2YXRhci9kZWZhdWx0LmpwZyIsImV4cCI6MTU4MzkyMjExMywiaWF0IjoxNTgzODM1NzEzLCJhdWQiOiJ3ZWIiLCJpc3MiOiJhdXRoLmR1eW5ndXllbnRhaWxvci5jb20vdXNlci93ZWIifQ.LWPcPY-IciA1ArBGJMulxVCmOC3uaB8F5rhBa8EXqBV35_ZN2UTQMYi93GrdqDYm1rxIKekim-D6J-2cmq9recRB3ZZCgAwjg6eT46NnJvVc_G8S_3EzJPX02zAa9wZP9j_EHNBvgL2E_N0OxJ3hAQTXGZYAeERFjzmkFwd0Ga1uKDkoOXU_8LYXwM3zmLq59QCYvPrbZ8Kaqxst-X4Vu4hM6Wvdmsk6lQNgPMN_AwjkhS329_LK42pA398gE2_gTMvBgGBx1adBEN0jA4WYtgioHBzI8As7Xbt4cQVA22Roge5Bj7PaAs3FY1jp0Tg0mA4eptwBteUN_vtLWhpGzA';
describe('Customer API', async () => {
    let records;
    let newRecord;

    beforeEach(async () => {
        records = [
            {
                id: 'KH001',
                name: 'Khách Hàng 1',
                avatar: '/avatar/avatar1.png',
                cover: '/cover/cover1.png',
                phone: '0987654321',
                email: 'email@gmail.com',
                address: '72 Tran Dang Ninh',
                birthday: '01/30/1980',
                gender: 'male',
                source: 'Website',
                relation: 'Tiềm Năng',
                friend: null,
                store:
                {
                    id: 'ST1',
                    name: 'Store 1',
                    phone: '0987645621',
                    is_default: true
                },
                created_by: {
                    id: 'hoanghung',
                    name: 'Hoang Hung'
                }
            },
            {
                id: 'KH002',
                name: 'Khách Hàng 2',
                avatar: '/avatar/avatar2.png',
                cover: '/cover/cover2.png',
                phone: '0987654322',
                email: 'email1@gmail.com',
                address: '73 Tran Dang Ninh',
                birthday: '01/30/1981',
                gender: 'female',
                source: 'Facebook',
                relation: 'Đối Tác',
                friend: null,
                store:
                {
                    id: 'ST2',
                    name: 'Store 2',
                    phone: '0987645621',
                    is_default: true
                },
                created_by: {
                    id: 'hoanghung',
                    name: 'Hoang Hung'
                }
            },
            {
                id: 'KH003',
                name: 'Khách Hàng 3',
                avatar: '/avatar/avatar3.png',
                cover: '/cover/cover3.png',
                phone: '0987654323',
                email: 'email2@gmail.com',
                address: '74 Tran Dang Ninh',
                birthday: '01/30/1982',
                gender: 'female',
                source: 'Facebook',
                relation: 'Đối Tác',
                friend: null,
                store:
                {
                    id: 'ST3',
                    name: 'Store 3',
                    phone: '0987645621',
                    is_default: true
                },
                created_by: {
                    id: 'hoanghung',
                    name: 'Hoang Hung'
                }
            }
        ];
        newRecord = {
            id: 'KH010',
            name: 'Khách Hàng 10',
            avatar: '/avatar/avatar10.png',
            cover: '/cover/cover10.png',
            phone: '0987654320',
            email: 'email10@gmail.com',
            address: '10 Tran Dang Ninh',
            birthday: '01/30/2010',
            gender: 'male',
            source: 'Facebook',
            relation: 'Đối Tác',
            friend: null,
            store:
            {
                id: 'ST10',
                name: 'Store 10',
                phone: '0987645620',
                is_default: true
            },
            created_by: {
                id: 'hoanghung',
                name: 'Hoang Hung'
            }
        };
        await Customer.destroy({
            where: { id: { [Op.ne]: null } }
        });
        await Customer.bulkCreate(records);
    });

    describe('GET /v1/customers/:id', () => {
        it('should get customer by id', async () => {
            let model = await Customer.findOne({
                id: records[0].id
            });

            model = Customer.transform(model);

            return request(app)
                .get(`/v1/customers/${model.id}`)
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    console.log(res.body);

                    expect(res.body.code).to.equal(0);
                    expect(res.body.data).to.deep.include(model);
                    console.log('ok');
                });
        });
        it('should report error when id not found', () => {
            return request(app)
                .get('/v1/customers/asdasdasd')
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

    describe('GET /v1/customers', () => {
        it('should get all customers', () => {
            return request(app)
                .get('/v1/customers')
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
        it('should get all customers with skip and limit', () => {
            return request(app)
                .get('/v1/customers')
                .set('Authorization', token)
                .query({ skip: 2, limit: 10 })
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
        it('should report error when skip is not a number', () => {
            return request(app)
                .get('/v1/customers')
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
                .get('/v1/customers')
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
        it('should get all customers with keyword', () => {
            return request(app)
                .get('/v1/customers')
                .set('Authorization', token)
                .query({ keyword: 'Khách Hàng 1' })
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
        it('should get all customers by create_at with start_time and end_time', () => {
            return request(app)
                .get('/v1/customers')
                .set('Authorization', token)
                .query({ by_date: 'create', start_time: '03/11/2020', end_time: '03/11/2020' })
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
        it('should get all customers by birthday with start_time and end_time', () => {
            return request(app)
                .get('/v1/customers')
                .set('Authorization', token)
                .query({ by_date: 'birthday', start_time: '01/30/1980', end_time: '01/30/1982' })
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
                .get('/v1/customers')
                .set('Authorization', token)
                .query({ by_date: 'birthday', start_time: 'asdasdas', end_time: '01/30/1982' })
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
                .get('/v1/customers')
                .set('Authorization', token)
                .query({ by_date: 'birthday', start_time: '01/30/1980', end_time: 'asdasdasd' })
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
        it('should get all customers with stores', () => {
            return request(app)
                .get('/v1/customers')
                .set('Authorization', token)
                .query('stores=["ST1"]')
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(1);
                    console.log('ok');
                });
        });
        it('should return error when stores not an array', () => {
            return request(app)
                .get('/v1/customers')
                .set('Authorization', token)
                .query({ stores: 'asdasdas' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('stores');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include(
                        '"stores" must be an array'
                    );
                    console.log('ok');
                });
        });
        it('should get all customers with genders', () => {
            return request(app)
                .get('/v1/customers')
                .set('Authorization', token)
                .query('genders=["male"]')
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(1);
                    console.log('ok');
                });
        });
        it('should return error when genders not an array', () => {
            return request(app)
                .get('/v1/customers')
                .set('Authorization', token)
                .query({ genders: 'asdasdas' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('genders');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include(
                        '"genders" must be an array'
                    );
                    console.log('ok');
                });
        });
        it('should get all customers with sources', () => {
            return request(app)
                .get('/v1/customers')
                .set('Authorization', token)
                .query('sources=["Website"]')
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(1);
                    console.log('ok');
                });
        });
        it('should return error when sources not an array', () => {
            return request(app)
                .get('/v1/customers')
                .set('Authorization', token)
                .query({ sources: 'asdasdas' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('sources');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include(
                        '"sources" must be an array'
                    );
                    console.log('ok');
                });
        });
    });

    describe('POST /v1/customers', () => {
        it('should create a new customer when request is ok', () => {
            return request(app)
                .post('/v1/customers')
                .set('Authorization', token)
                .send(newRecord)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    console.log(res.body);
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when id already exists', () => {
            return request(app)
                .post('/v1/customers')
                .set('Authorization', token)
                .send(Object.assign({}, newRecord, { id: 'KH001' }))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    console.log(res.body);

                    // expect(res.body.code).to.equal(500);
                    // expect(res.body.errors[0].message).to.equal('id must be unique');
                    console.log('ok');
                });
        });
        it('should create a new customer when id is null', () => {
            return request(app)
                .post('/v1/customers')
                .set('Authorization', token)
                .send(omit(newRecord, 'id'))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when required fields is not provided', () => {
            const requiredFields = ['name', 'phone', 'store'];
            newRecord = omit(newRecord, requiredFields);
            return request(app)
                .post('/v1/customers')
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
        it('should report error when phone already exists', () => {
            return request(app)
                .post('/v1/customers')
                .set('Authorization', token)
                .send(Object.assign({}, newRecord, { phone: '0987654321' }))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(400);
                    expect(res.body.message).to.equal('Số điện thoại này đã tồn tại.!');
                    console.log('ok');
                });
        });
        it('should report error when email already exists', () => {
            return request(app)
                .post('/v1/customers')
                .set('Authorization', token)
                .send(Object.assign({}, newRecord, { email: 'email@gmail.com' }))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(400);
                    expect(res.body.message).to.equal('Địa chỉ email này đã tồn tại.!');
                    console.log('ok');
                });
        });
        it('should create a new customer and set default values', () => {
            const defaultValues = ['email', 'avatar', 'cover', 'images', 'birthday', 'gender', 'address', 'source', 'relation', 'friend', 'rank'];
            newRecord = omit(
                newRecord, defaultValues
            );
            return request(app)
                .post('/v1/customers')
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

    describe('PUT /v1/customers/:id', () => {
        it('should update customer success', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send(Object.assign({}, newRecord))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when update a customer with incorrect id', () => {
            return request(app)
                .put('/v1/customers/sdsada')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                    console.log('ok');
                });
        });
        // it('should report error when incorrect fields customer', async () => {
        //     const incorrectFields = ['name', 'phone', 'email', 'avatar', 'cover', 'gender', 'address', 'source', 'relation', 'store'];
        //     forEach(incorrectFields, value => {
        //         return request(app)
        //             .put('/v1/customers/KH002')
        //             .set('Authorization', token)
        //             .send(`{${value}: {}}`)
        //             .expect('Content-Type', /json/)
        //             .expect(httpStatus.OK)
        //             .then((res) => {
        //                 console.log(res.body);
        //                 console.log('ok');
        //             });
        //     });
        // });
        it('should update correct name customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ name: 'Khach hang 2 update' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect name customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
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
        it('should update correct phone customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ phone: '0987789321' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when update phone already exists', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ phone: '0987654322' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(400);
                    expect(res.body.message).to.equal('Số điện thoại này đã tồn tại.!');
                    console.log('ok');
                });
        });
        it('should report error when incorrect phone customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ phone: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('phone');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"phone" must be a string');
                    console.log('ok');
                });
        });
        it('should update correct email customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ email: 'emailUpdate@gmail.com' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when update email already exists', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ email: 'email1@gmail.com' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(400);
                    expect(res.body.message).to.equal('Địa chỉ email này đã tồn tại.!');
                });
        });
        it('should report error when incorrect email customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ email: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('email');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"email" must be a string');
                    console.log('ok');
                });
        });
        it('should update correct avatar customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ avatar: '/avatar2_update.png' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect avatar customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ avatar: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('avatar');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"avatar" must be a string');
                    expect(res.body.errors[0].messages[0]).to.equal('"avatar" must be a string');
                    console.log('ok');
                });
        });
        it('should update correct cover customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ cover: '/cover1_update.png' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect cover customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ cover: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('cover');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"cover" must be a string');
                    console.log('ok');
                });
        });
        it('should update correct birthday customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ birthday: '11/11/2011' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect birthday customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ birthday: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('birthday');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include(
                        '"birthday" must be a number of milliseconds or valid date string'
                    );
                    console.log('ok');
                });
        });
        it('should update correct gender customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ gender: 'male' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect gender customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ gender: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('gender');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"gender" must be a string');
                    console.log('ok');
                });
        });
        it('should update correct address customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ address: '10 Tran Dang Ninh' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect address customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ address: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('address');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"address" must be a string');
                    console.log('ok');
                });
        });
        it('should update correct source customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ source: 'Website' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect source customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ source: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('source');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"source" must be a string');
                    console.log('ok');
                });
        });
        it('should update correct relation customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ relation: 'Tiềm Năng' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect relation customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ relation: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('relation');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"relation" must be a string');
                    console.log('ok');
                });
        });
        it('should update correct friend customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ friend: { id: 'f1', name: 'MrA', phone: '0987789987' } })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect friend customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ friend: 'asd' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('friend');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"friend" must be an object');
                    console.log('ok');
                });
        });
        it('should update correct store customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ store: newRecord.store })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect store customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ store: 123 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('store');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"store" must be an object');
                    console.log('ok');
                });
        });
        it('should update correct rank customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ rank: 'vip' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect rank customer', () => {
            return request(app)
                .put('/v1/customers/KH002')
                .set('Authorization', token)
                .send({ rank: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('rank');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"rank" must be a string');
                    console.log('ok');
                });
        });
    });

    describe('DELETE /v1/customers/:id', () => {
        it('should report error when delete a customer with incorrect id', () => {
            return request(app)
                .delete('/v1/customers/sdsada')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                    console.log('ok');
                });
        });
        it('should delete a customer when correct id', () => {
            return request(app)
                .delete('/v1/customers/KH003')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.not.equal(400);
                    expect(res.body.code).to.not.equal(404);
                    console.log('ok');
                });
        });
    });
});
